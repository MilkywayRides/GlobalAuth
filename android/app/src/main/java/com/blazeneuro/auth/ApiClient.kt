package com.blazeneuro.auth

import android.content.Context
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*

object ApiClient {
    private const val BASE_URL = "https://developer.blazeneuro.com/api/"
    
    fun create(context: Context): ApiService {
        val client = OkHttpClient.Builder()
            .addInterceptor(AuthInterceptor(context))
            .build()
            
        return Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}

class AuthInterceptor(private val context: Context) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): okhttp3.Response {
        val apiKey = SecureStorage.getApiKey(context)
        val request = chain.request().newBuilder()
            .addHeader("Authorization", "Bearer $apiKey")
            .addHeader("X-API-Key", apiKey ?: "")
            .build()
        return chain.proceed(request)
    }
}

interface ApiService {
    @POST("api/auth/login")
    suspend fun login(@Body request: AuthRequest): AuthResponse
    
    @POST("api/auth/signup") 
    suspend fun signup(@Body request: AuthRequest): AuthResponse
    
    @GET("api/auth/verify")
    suspend fun verifyToken(): UserResponse
    
    @POST("api/oauth/authorize")
    suspend fun authorize(@Body request: OAuthRequest): OAuthResponse
    
    @POST("api/oauth/token")
    suspend fun exchangeToken(@Body request: TokenRequest): TokenResponse
    
    @POST("api/auth/webhook")
    suspend fun webhook(@Body data: WebhookData): WebhookResponse
}

data class AuthRequest(val email: String, val password: String)
data class AuthResponse(val token: String, val user: User)
data class User(val id: String, val name: String, val email: String)
data class UserResponse(val user: User)
data class WebhookData(val event: String, val userId: String, val timestamp: Long)
data class WebhookResponse(val success: Boolean)
data class OAuthRequest(val clientId: String, val redirectUri: String, val scope: String)
data class OAuthResponse(val authorizationUrl: String, val state: String)
data class TokenRequest(val code: String, val clientId: String, val clientSecret: String, val redirectUri: String)
data class TokenResponse(val accessToken: String, val tokenType: String, val expiresIn: Int)
