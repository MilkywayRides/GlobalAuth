package com.blazeneuro.auth

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import java.security.KeyStore
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey

object SecureStorage {
    private const val KEYSTORE_ALIAS = "BlazeNeuroKey"
    private const val PREFS_NAME = "secure_prefs"
    
    fun init(context: Context): EncryptedSharedPreferences {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
            
        return EncryptedSharedPreferences.create(
            context,
            PREFS_NAME,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        ) as EncryptedSharedPreferences
    }
    
    fun storeApiKey(context: Context, apiKey: String) {
        val prefs = init(context)
        prefs.edit().putString("api_key", apiKey).apply()
    }
    
    fun getApiKey(context: Context): String? {
        val prefs = init(context)
        return prefs.getString("api_key", null)
    }
}
