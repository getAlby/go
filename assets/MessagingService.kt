package com.getalby.mobile

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
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

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        val notificationId = System.currentTimeMillis().toInt()

        val notificationManager = NotificationManagerCompat.from(this)

        if (remoteMessage.data.isEmpty()) {
            return
        }

        if (!remoteMessage.data.containsKey("body")) {
            return
        }
        
        var encryptedContent = ""
        var appPubkey = ""
        val body = remoteMessage.data["body"] ?: return

        if (body.isEmpty()) {
            return
        }

        try {
            val jsonBody = JSONObject(body)
            encryptedContent = jsonBody.optString("content", "")
            appPubkey = jsonBody.optString("appPubkey", "")
        } catch (e: Exception) {
            return
        }

        if (encryptedContent.isEmpty()) {
            return
        }

        if (appPubkey.isEmpty()) {
            return
        }

        val sharedSecret = getSharedSecretFromPreferences(this, appPubkey)
        val walletName = getWalletNameFromPreferences(this, appPubkey) ?: "Alby Go"

        if (sharedSecret.isNullOrEmpty()) {
          return
        }

        val sharedSecretBytes = hexStringToByteArray(sharedSecret)
        val decryptedContent = decrypt(encryptedContent, sharedSecretBytes)

        if (decryptedContent == null) {
            return
        }

        // TODO: remove if notification type is not payment_received
        val amount = try {
            val json = JSONObject(decryptedContent)
            val notification = json.getJSONObject("notification")
            notification.getInt("amount") / 1000
        } catch (e: Exception) {
            return
        }

        val notificationText = "You have received $amount sats ⚡️"

        // TODO: check if these are the right channel ids corressponding to expo code
        // Create a notification channel for Android O and above
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "default",
                "default",
                NotificationManager.IMPORTANCE_HIGH
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }

        // Build the notification
        val notificationBuilder = NotificationCompat.Builder(this, "default")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(walletName)
            .setContentText(notificationText)
            .setAutoCancel(true)
        notificationManager.notify(notificationId, notificationBuilder.build())
    }

    private fun getSharedSecretFromPreferences(context: Context, key: String): String? {
      val sharedPreferences = context.getSharedPreferences(context.packageName + ".settings", Context.MODE_PRIVATE)
      return sharedPreferences.getString("${key}_shared_secret", null)
    }

    private fun getWalletNameFromPreferences(context: Context, key: String): String? {
      val sharedPreferences = context.getSharedPreferences(context.packageName + ".settings", Context.MODE_PRIVATE)
      return sharedPreferences.getString("${key}_name", null)
    }

    // Function to decrypt the content
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
            e.printStackTrace()
            null
        }
    }

    // Helper function to convert hex string to byte array
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
}
