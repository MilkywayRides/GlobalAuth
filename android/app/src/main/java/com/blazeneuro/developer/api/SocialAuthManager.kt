package com.blazeneuro.developer.api

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.browser.customtabs.CustomTabsIntent
import com.blazeneuro.developer.utils.SecureTokenStorage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class SocialAuthManager(private val context: Context) {
    private val apiClient = AuthApiClient(context)
    private val storage = SecureTokenStorage(context)

    suspend fun startGoogleAuth(): Result<String> {
        return apiClient.getSocialAuthUrl("google")
    }

    suspend fun startGithubAuth(): Result<String> {
        return apiClient.getSocialAuthUrl("github")
    }

    fun openAuthUrl(authUrl: String) {
        val customTabsIntent = CustomTabsIntent.Builder()
            .setShowTitle(true)
            .build()
        
        customTabsIntent.launchUrl(context, Uri.parse(authUrl))
    }

    suspend fun handleAuthCallback(uri: Uri): Result<AuthResponse> = withContext(Dispatchers.IO) {
        try {
            val code = uri.getQueryParameter("code")
            val state = uri.getQueryParameter("state")
            
            if (code == null) {
                return@withContext Result.failure(Exception("No auth code received"))
            }

            val url = URL("https://developer.blazeneuro.com/api/mobile/auth/social")
            val connection = url.openConnection() as HttpURLConnection
            
            connection.apply {
                requestMethod = "POST"
                setRequestProperty("Content-Type", "application/json")
                doOutput = true
            }

            val json = JSONObject().apply {
                put("code", code)
                put("state", state)
            }

            connection.outputStream.use { it.write(json.toString().toByteArray()) }

            if (connection.responseCode == 200) {
                val response = connection.inputStream.bufferedReader().readText()
                val jsonResponse = JSONObject(response)
                
                val authResponse = AuthResponse(
                    token = jsonResponse.getString("token"),
                    user = User(
                        id = jsonResponse.getJSONObject("user").getString("id"),
                        name = jsonResponse.getJSONObject("user").optString("name"),
                        email = jsonResponse.getJSONObject("user").getString("email"),
                        image = jsonResponse.getJSONObject("user").optString("image")
                    )
                )
                
                storage.saveToken(authResponse.token)
                Result.success(authResponse)
            } else {
                Result.failure(Exception("Social auth failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
