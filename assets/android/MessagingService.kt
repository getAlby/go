package com.getalby.mobile

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Build
// import android.os.PowerManager
import android.util.Base64
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import org.json.JSONObject
import java.nio.charset.Charset
import javax.crypto.Cipher
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.SecretKeySpec
import java.io.ByteArrayOutputStream
import org.bouncycastle.crypto.engines.ChaCha7539Engine
import org.bouncycastle.crypto.params.KeyParameter
import org.bouncycastle.crypto.params.ParametersWithIV
import android.util.Log
import android.speech.tts.TextToSpeech
import android.speech.tts.TextToSpeech.OnInitListener
import java.util.Locale

class MessagingService : FirebaseMessagingService(), OnInitListener {
    private lateinit var tts: TextToSpeech
    private val ttsQueue = mutableListOf<String>()
    private var ttsReady = false

    companion object {
        private const val TAG = "AlbyHubMessagingService"
    }

    override fun onCreate() {
        super.onCreate()
        tts = TextToSpeech(this, this)
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            val result = tts.setLanguage(Locale.US)
            if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                Log.e(TAG, "Failed to find language: $result")
                return
            }
            Log.i(TAG, "Set TTS language from US Locale")
            ttsReady = true

            // Speak any queued messages
            while (ttsQueue.isNotEmpty()) {
                Log.i(TAG, "Speaking queued message")
                speakOut(ttsQueue.removeAt(0))
            }
        } else {
            Log.e(TAG, "Failed to setup TextToSpeech: $status")
        }
    }
    
    data class WalletInfo(
        val name: String,
        val sharedSecret: String,
        val version: String = "0.0"
    )

    private fun getTtsNotificationsEnabledFromPreferences(context: Context): Boolean {
      val sharedPreferences = context.getSharedPreferences("${context.packageName}.settings", Context.MODE_PRIVATE)
      val settingsString = sharedPreferences.getString("settings", null) ?: return false
      try {
        val settingsJson = JSONObject(settingsString)
        val ttsEnabledString = settingsJson.optString("ttsEnabled")
        return ttsEnabledString == "true"
      } catch (e: Exception) {
          e.printStackTrace()
          return false
      }
    }

    private fun getWalletInfo(context: Context, key: String): WalletInfo? {
      val sharedPreferences = context.getSharedPreferences("${context.packageName}.settings", Context.MODE_PRIVATE)
      val walletsString = sharedPreferences.getString("wallets", null) ?: return null
      return try {
          val walletsJson = JSONObject(walletsString)
          val walletJson = walletsJson.optJSONObject(key) ?: return null
          WalletInfo(
              name = walletJson.optString("name", "Alby Go"),
              sharedSecret = walletJson.optString("sharedSecret", ""),
              version = walletJson.optString("version", "0.0")
          )
      } catch (e: Exception) {
          e.printStackTrace()
          null
      }
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        if (remoteMessage.data.isEmpty()) {
            return
        }
        Log.i(TAG, "Received notification")

        val messageData = remoteMessage.data
        val body = messageData["body"] ?: return

        val jsonBody = try {
            JSONObject(body)
        } catch (e: Exception) {
            return
        }

        val encryptedContent = jsonBody.optString("content", "")
        val appPubkey = jsonBody.optString("appPubkey", "")

        if (encryptedContent.isEmpty() || appPubkey.isEmpty()) {
            return
        }

        val walletInfo = getWalletInfo(this, appPubkey) ?: return
        if (walletInfo.sharedSecret.isEmpty()) {
            return
        }
        val sharedSecretBytes = hexStringToByteArray(walletInfo.sharedSecret)
        val walletName = walletInfo.name

        val decryptedContent = decrypt(encryptedContent, sharedSecretBytes, walletInfo.version) ?: return

        val json = try {
            JSONObject(decryptedContent)
        } catch (e: Exception) {
            return
        }

        val notificationType = json.optString("notification_type", "")
        if (notificationType != "payment_sent" && notificationType != "payment_received" && notificationType != "hold_invoice_accepted") {
            return
        }

        val notification = json.optJSONObject("notification") ?: return
        val amount = notification.optInt("amount", 0) / 1000
        val transaction = notification.toString()

        var notificationText = ""
        if (notificationType == "payment_sent") {
            notificationText = "You sent $amount sats ⚡️"
        } else if (notificationType == "payment_received") {
            notificationText = "You received $amount sats ⚡️"
        } else if (notificationType == "hold_invoice_accepted") {
            notificationText = "Payment held: $amount sats ⏳"
        }

        val intent = Intent(Intent.ACTION_VIEW).apply {
            data = Uri.parse("alby://payment_notification?transaction=${Uri.encode(transaction)}&app_pubkey=${appPubkey}")
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }

        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notificationBuilder = NotificationCompat.Builder(this, "default")
            .setSmallIcon(R.drawable.notification_icon)
            .setContentTitle(walletName)
            .setContentText(notificationText)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)

        val notificationManager = NotificationManagerCompat.from(this)
        val notificationId = System.currentTimeMillis().toInt()
        notificationManager.notify(notificationId, notificationBuilder.build())

        if (notificationType == "payment_received") {
            var ttsMessage = "$amount sat"
            if (ttsReady) {
                speakOut(ttsMessage)
            } else {
                ttsQueue.add(ttsMessage)
                Log.w(TAG, "TTS not initialized yet, queued message: $ttsMessage")
            }
        }
    }

    private fun speakOut(text: String) {
        if (!getTtsNotificationsEnabledFromPreferences(this)) {
            Log.i(TAG, "TTS notifications disabled, skipping")
            return
        }
        Log.i(TAG, "Speaking: $text")
        val result = tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, null)
        if (result == TextToSpeech.ERROR) {
            Log.e(TAG, "Error occurred while trying to speak: $text")
        }
    }

    private fun decrypt(content: String, key: ByteArray, version: String): String? {
        return if (version == "1.0") {
            decryptNip44(content, key)
        } else {
            decryptNip04(content, key)
        }
    }

    private fun decryptNip04(content: String, key: ByteArray): String? {
        val parts = content.split("?iv=")
        if (parts.size < 2) {
            return null
        }

        val ciphertext = Base64.decode(parts[0], Base64.DEFAULT)
        val iv = Base64.decode(parts[1], Base64.DEFAULT)

        return try {
            val cipher = Cipher.getInstance("AES/CBC/PKCS7Padding")
            val secretKey = SecretKeySpec(key, "AES")
            val ivParams = IvParameterSpec(iv)
            cipher.init(Cipher.DECRYPT_MODE, secretKey, ivParams)

            val plaintext = cipher.doFinal(ciphertext)
            String(plaintext, Charset.forName("UTF-8"))
        } catch (e: Exception) {
            null
        }
    }

    private fun decryptNip44(b64CiphertextWrapped: String, conversationKey: ByteArray): String? {
        val decoded = try {
            Base64.decode(b64CiphertextWrapped, Base64.DEFAULT)
        } catch (e: Exception) {
            return null
        }

        if (decoded.size < 99 || decoded.size > 65603) {
            return null
        }

        if (decoded[0].toInt() != 2) {
            return null
        }

        val nonce = decoded.copyOfRange(1, 33)
        val ciphertext = decoded.copyOfRange(33, decoded.size - 32)
        val givenMac = decoded.copyOfRange(decoded.size - 32, decoded.size)

        val (cc20key, cc20nonce, hmacKey) = messageKeys(conversationKey, nonce)

        val expectedMac = sha256Hmac(hmacKey, ciphertext, nonce)
        if (expectedMac == null || !expectedMac.contentEquals(givenMac)) {
            return null
        }

        val padded = chacha20(cc20key, cc20nonce, ciphertext) ?: return null
        if (padded.size < 2) {
            return null
        }

        val unpaddedLen = ((padded[0].toInt() and 0xFF) shl 8) or
                          (padded[1].toInt() and 0xFF)

        if (unpaddedLen < 1 || unpaddedLen > 65535) {
            return null
        }

        val requiredSize = 2 + calcPadding(unpaddedLen)
        if (padded.size != requiredSize) {
            return null
        }

        val messageBytes = padded.copyOfRange(2, 2 + unpaddedLen)
        return String(messageBytes, Charsets.UTF_8)
    }

    private fun messageKeys(conversationKey: ByteArray, nonce: ByteArray): Triple<ByteArray, ByteArray, ByteArray> {
        val hkdfBytes = hkdfExpandSha256(conversationKey, nonce, 32 + 12 + 32) 
        val cc20key = hkdfBytes.copyOfRange(0, 32)
        val cc20nonce = hkdfBytes.copyOfRange(32, 32 + 12)
        val hmacKey = hkdfBytes.copyOfRange(44, 44 + 32)
        return Triple(cc20key, cc20nonce, hmacKey)
    }

    private fun chacha20(key: ByteArray, nonce: ByteArray, message: ByteArray): ByteArray? {
        return try {
            val engine = ChaCha7539Engine()
            engine.init(true, ParametersWithIV(KeyParameter(key), nonce))

            val output = ByteArray(message.size)
            engine.processBytes(message, 0, message.size, output, 0)
            output
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    private fun sha256Hmac(key: ByteArray, ciphertext: ByteArray, nonce: ByteArray): ByteArray? {
        return try {
            val mac = javax.crypto.Mac.getInstance("HmacSHA256")
            val secretKey = SecretKeySpec(key, "HmacSHA256")
            mac.init(secretKey)
            mac.update(nonce)
            mac.update(ciphertext)
            mac.doFinal()
        } catch (e: Exception) {
            null
        }
    }

    private fun calcPadding(msgSize: Int): Int {
        if (msgSize <= 32) return 32

        val s = msgSize - 1
        val highestBit = 32 - Integer.numberOfLeadingZeros(s)
        val nextPowTwo = 1 shl highestBit
        val chunk = kotlin.math.max(32, nextPowTwo / 8)
        val blocks = (s / chunk) + 1
        return chunk * blocks
    }

    private fun hkdfExpandSha256(prk: ByteArray, info: ByteArray, outLen: Int): ByteArray {
        val hashLen = 32
        val n = (outLen + hashLen - 1) / hashLen
        var t = ByteArray(0)
        val okm = ByteArrayOutputStream()

        for (i in 1..n) {
            val mac = javax.crypto.Mac.getInstance("HmacSHA256")
            val keySpec = SecretKeySpec(prk, "HmacSHA256")
            mac.init(keySpec)

            mac.update(t)
            mac.update(info)
            mac.update(i.toByte())

            t = mac.doFinal()
            okm.write(t)
        }

        val result = okm.toByteArray()
        return if (result.size > outLen) result.copyOf(outLen) else result
    }

    private fun hexStringToByteArray(s: String): ByteArray {
        val len = s.length
        val data = ByteArray(len / 2)
        var i = 0
        while (i < len) {
            data[i / 2] = ((Character.digit(s[i], 16) shl 4)
                    + Character.digit(s[i + 1], 16)).toByte()
            i += 2
        }
        return data
    }

    // private fun wakeApp() {
    //   @Suppress("DEPRECATION")
    //   val pm = applicationContext.getSystemService(POWER_SERVICE) as PowerManager
    //   val screenIsOn = pm.isInteractive
    //   if (!screenIsOn) {
    //       val wakeLockTag = packageName + "WAKELOCK"
    //       val wakeLock = pm.newWakeLock(
    //           PowerManager.FULL_WAKE_LOCK or
    //           PowerManager.ACQUIRE_CAUSES_WAKEUP or
    //           PowerManager.ON_AFTER_RELEASE, wakeLockTag
    //       )
    //       wakeLock.acquire()
    //   }
    // }
}
