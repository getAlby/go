package com.getalby.mobile

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.graphics.Color
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

class MessagingService : FirebaseMessagingService() {

    data class WalletInfo(
        val name: String,
        val sharedSecret: String
    )

    private fun getWalletInfo(context: Context, key: String): WalletInfo? {
      val sharedPreferences = context.getSharedPreferences("${context.packageName}.settings", Context.MODE_PRIVATE)
      val walletsString = sharedPreferences.getString("wallets", null) ?: return null
      return try {
          val walletsJson = JSONObject(walletsString)
          val walletJson = walletsJson.optJSONObject(key) ?: return null
          WalletInfo(
              name = walletJson.optString("name", "Alby Go"),
              sharedSecret = walletJson.optString("sharedSecret", "")
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

        val data = remoteMessage.data
        val body = data["body"] ?: return

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

        val decryptedContent = decrypt(encryptedContent, sharedSecretBytes) ?: return

        val json = try {
            JSONObject(decryptedContent)
        } catch (e: Exception) {
            return
        }

        val notificationType = json.optString("notification_type", "")
        if (notificationType != "payment_received") {
            return
        }

        val notification = json.optJSONObject("notification") ?: return
        val amount = notification.optInt("amount", 0) / 1000

        val notificationText = "You have received $amount sats ⚡️"

        val notificationBuilder = NotificationCompat.Builder(this, "default")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(walletName)
            .setContentText(notificationText)
            .setAutoCancel(true)
        val notificationManager = NotificationManagerCompat.from(this)
        val notificationId = System.currentTimeMillis().toInt()
        notificationManager.notify(notificationId, notificationBuilder.build())
        // wakeApp()
    }

    private fun getSharedSecretFromPreferences(context: Context, key: String): String? {
      val sharedPreferences = context.getSharedPreferences("${context.packageName}.settings", Context.MODE_PRIVATE)
      return sharedPreferences.getString("${key}_shared_secret", null)
    }

    private fun getWalletNameFromPreferences(context: Context, key: String): String? {
      val sharedPreferences = context.getSharedPreferences("${context.packageName}.settings", Context.MODE_PRIVATE)
      return sharedPreferences.getString("${key}_name", null)
    }

    private fun decrypt(content: String, key: ByteArray): String? {
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
