package com.blazeneuro.developer.utils

import android.content.Context
import android.content.SharedPreferences
import com.blazeneuro.developer.api.User

class PreferenceManager(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("blazeneuro_prefs", Context.MODE_PRIVATE)
    
    companion object {
        private const val KEY_IS_LOGGED_IN = "is_logged_in"
        private const val KEY_USER_ID = "user_id"
        private const val KEY_USER_NAME = "user_name"
        private const val KEY_USER_EMAIL = "user_email"
        private const val KEY_USER_ROLE = "user_role"
        private const val KEY_EMAIL_VERIFIED = "email_verified"
        private const val KEY_TOKEN = "token"
    }
    
    fun saveUser(user: User, token: String) {
        prefs.edit().apply {
            putBoolean(KEY_IS_LOGGED_IN, true)
            putString(KEY_USER_ID, user.id)
            putString(KEY_USER_NAME, user.name)
            putString(KEY_USER_EMAIL, user.email)
            putString(KEY_USER_ROLE, user.role)
            putBoolean(KEY_EMAIL_VERIFIED, user.emailVerified)
            putString(KEY_TOKEN, token)
            apply()
        }
    }
    
    fun isLoggedIn(): Boolean = prefs.getBoolean(KEY_IS_LOGGED_IN, false)
    
    fun getUser(): User? {
        return if (isLoggedIn()) {
            User(
                id = prefs.getString(KEY_USER_ID, "") ?: "",
                name = prefs.getString(KEY_USER_NAME, "") ?: "",
                email = prefs.getString(KEY_USER_EMAIL, "") ?: "",
                role = prefs.getString(KEY_USER_ROLE, "") ?: "",
                emailVerified = prefs.getBoolean(KEY_EMAIL_VERIFIED, false)
            )
        } else null
    }
    
    fun getToken(): String? = prefs.getString(KEY_TOKEN, null)
    
    fun updateEmailVerified(verified: Boolean) {
        prefs.edit().putBoolean(KEY_EMAIL_VERIFIED, verified).apply()
    }
    
    fun clearUser() {
        prefs.edit().clear().apply()
    }
    
    fun logout() {
        clearUser()
    }
    
    fun isOnboardingCompleted(): Boolean {
        return prefs.getBoolean("onboarding_completed", false)
    }
    
    fun setOnboardingCompleted() {
        prefs.edit().putBoolean("onboarding_completed", true).apply()
    }
}
