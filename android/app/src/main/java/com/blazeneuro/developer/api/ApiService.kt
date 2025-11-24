package com.blazeneuro.developer.api

import retrofit2.Response
import retrofit2.http.*

data class LoginRequest(val email: String, val password: String)
data class SignupRequest(val name: String, val email: String, val password: String)
data class QRConfirmRequest(val action: String)

data class AuthResponse(
    val success: Boolean,
    val user: User? = null,
    val token: String? = null,
    val message: String? = null
)

data class User(
    val id: String,
    val name: String,
    val email: String,
    val role: String
)

data class QRResponse(
    val status: String,
    val message: String? = null
)

interface ApiService {
    @POST("api/auth/mobile-login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>
    
    @POST("api/auth/signup")
    suspend fun signup(@Body request: SignupRequest): Response<AuthResponse>
    
    @POST("api/auth/qr/status/{sessionId}")
    suspend fun confirmQR(
        @Path("sessionId") sessionId: String,
        @Body request: QRConfirmRequest
    ): Response<QRResponse>
    
    @POST("api/auth/qr/status/{sessionId}")
    suspend fun confirmQRWithUser(
        @Path("sessionId") sessionId: String,
        @Body request: Map<String, String>
    ): Response<QRResponse>
    
    @GET("api/auth/qr/status/{sessionId}")
    suspend fun getQRStatus(@Path("sessionId") sessionId: String): Response<QRResponse>
}
