package com.blazeneuro.developer.api

import android.content.Context
import com.blazeneuro.developer.utils.PreferenceManager
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object ApiClient {
    private const val BASE_URL = "https://developer.blazeneuro.com/"
    
    private var context: Context? = null
    
    fun init(appContext: Context) {
        context = appContext
    }
    
    private val authInterceptor = Interceptor { chain ->
        val token = context?.let { PreferenceManager(it).getToken() }
        val request = if (token != null) {
            chain.request().newBuilder()
                .addHeader("Authorization", "Bearer $token")
                .addHeader("Cookie", "better-auth.session_token=$token")
                .build()
        } else {
            chain.request()
        }
        chain.proceed(request)
    }
    
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }
    
    private val httpClient = OkHttpClient.Builder()
        .addInterceptor(authInterceptor)
        .addInterceptor(loggingInterceptor)
        .build()
    
    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(httpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()
    
    val apiService: ApiService = retrofit.create(ApiService::class.java)
}
