package com.blazeneuro.auth

import android.content.Context
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

object WebhookHandler {
    
    fun sendLoginEvent(context: Context, userId: String) {
        sendWebhook(context, "user_login", userId)
    }
    
    fun sendLogoutEvent(context: Context, userId: String) {
        sendWebhook(context, "user_logout", userId)
    }
    
    fun sendSignupEvent(context: Context, userId: String) {
        sendWebhook(context, "user_signup", userId)
    }
    
    private fun sendWebhook(context: Context, event: String, userId: String) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val apiService = ApiClient.create(context)
                val webhookData = WebhookData(
                    event = event,
                    userId = userId,
                    timestamp = System.currentTimeMillis()
                )
                apiService.webhook(webhookData)
            } catch (e: Exception) {
                // Silent fail for webhooks
            }
        }
    }
}
