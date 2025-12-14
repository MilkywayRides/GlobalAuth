package com.blazeneuro.developer.api

import android.content.Context
import android.net.Uri
import androidx.browser.customtabs.CustomTabsIntent
import com.blazeneuro.developer.utils.SecureTokenStorage

class SocialAuthManager(private val context: Context) {
    private val storage = SecureTokenStorage(context)
    private val baseUrl = "https://developer.blazeneuro.com"

    fun startGoogleAuth() {
        val authUrl = "$baseUrl/api/auth/signin/google?callbackUrl=blazeneuro://auth"
        openAuthUrl(authUrl)
    }

    fun startGithubAuth() {
        val authUrl = "$baseUrl/api/auth/signin/github?callbackUrl=blazeneuro://auth"
        openAuthUrl(authUrl)
    }

    private fun openAuthUrl(authUrl: String) {
        val customTabsIntent = CustomTabsIntent.Builder()
            .setShowTitle(true)
            .build()
        
        customTabsIntent.launchUrl(context, Uri.parse(authUrl))
    }

    fun handleAuthCallback(uri: Uri): Result<AuthResponse> {
        return try {
            val token = uri.getQueryParameter("token")
            val userJson = uri.getQueryParameter("user")
            
            if (token == null || userJson == null) {
                return Result.failure(Exception("Invalid callback data"))
            }

            storage.saveToken(token)
            
            val userObj = org.json.JSONObject(userJson)
            val authResponse = AuthResponse(
                token = token,
                user = User(
                    id = userObj.getString("id"),
                    name = userObj.optString("name"),
                    email = userObj.getString("email"),
                    image = userObj.optString("image")
                )
            )
            
            Result.success(authResponse)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
