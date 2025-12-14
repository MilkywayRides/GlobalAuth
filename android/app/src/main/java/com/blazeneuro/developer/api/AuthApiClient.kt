package com.blazeneuro.developer.api

import android.content.Context
import com.blazeneuro.developer.utils.SecureTokenStorage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

data class User(
    val id: String,
    val name: String?,
    val email: String,
    val image: String?
)

data class AuthResponse(
    val token: String,
    val user: User
)

class AuthApiClient(private val context: Context) {
    private val baseUrl = "https://developer.blazeneuro.com/api/mobile/auth"
    private val storage = SecureTokenStorage(context)

    suspend fun login(email: String, password: String): Result<AuthResponse> = withContext(Dispatchers.IO) {
        try {
            val url = URL("$baseUrl/login")
            val connection = url.openConnection() as HttpURLConnection
            
            connection.apply {
                requestMethod = "POST"
                setRequestProperty("Content-Type", "application/json")
                doOutput = true
            }

            val json = JSONObject().apply {
                put("email", email)
                put("password", password)
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
                Result.failure(Exception("Login failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun signup(name: String, email: String, password: String): Result<AuthResponse> = withContext(Dispatchers.IO) {
        try {
            val url = URL("$baseUrl/signup")
            val connection = url.openConnection() as HttpURLConnection
            
            connection.apply {
                requestMethod = "POST"
                setRequestProperty("Content-Type", "application/json")
                doOutput = true
            }

            val json = JSONObject().apply {
                put("name", name)
                put("email", email)
                put("password", password)
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
                Result.failure(Exception("Signup failed"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun verifyToken(): Result<User> = withContext(Dispatchers.IO) {
        try {
            val token = storage.getToken() ?: return@withContext Result.failure(Exception("No token"))
            
            val url = URL("$baseUrl/verify")
            val connection = url.openConnection() as HttpURLConnection
            
            connection.apply {
                requestMethod = "POST"
                setRequestProperty("Authorization", "Bearer $token")
            }

            if (connection.responseCode == 200) {
                val response = connection.inputStream.bufferedReader().readText()
                val jsonResponse = JSONObject(response)
                
                val user = User(
                    id = jsonResponse.getJSONObject("user").getString("id"),
                    name = jsonResponse.getJSONObject("user").optString("name"),
                    email = jsonResponse.getJSONObject("user").getString("email"),
                    image = jsonResponse.getJSONObject("user").optString("image")
                )
                
                Result.success(user)
            } else {
                storage.clearToken()
                Result.failure(Exception("Invalid token"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getSocialAuthUrl(provider: String): Result<String> = withContext(Dispatchers.IO) {
        try {
            val url = URL("$baseUrl/social?provider=$provider")
            val connection = url.openConnection() as HttpURLConnection
            
            if (connection.responseCode == 200) {
                val response = connection.inputStream.bufferedReader().readText()
                val jsonResponse = JSONObject(response)
                Result.success(jsonResponse.getString("authUrl"))
            } else {
                Result.failure(Exception("Failed to get auth URL"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun logout() {
        storage.clearToken()
    }

    fun isLoggedIn(): Boolean = storage.getToken() != null
}
