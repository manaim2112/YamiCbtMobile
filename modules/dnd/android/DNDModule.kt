package expo.modules.dnd

import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class DNDModule : Module() {
    private val notificationManager: NotificationManager?
        get() = appContext.reactContext
            ?.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager

    override fun definition() = ModuleDefinition {
        Name("DNDModule")

        AsyncFunction("isPermissionGranted") {
            notificationManager?.isNotificationPolicyAccessGranted ?: false
        }

        AsyncFunction("requestPermission") {
            val intent = Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            appContext.reactContext?.startActivity(intent)
        }

        AsyncFunction("enableDND") {
            val nm = notificationManager
                ?: throw Exception("NotificationManager not available")

            if (!nm.isNotificationPolicyAccessGranted) {
                throw Exception("DND permission not granted. Call requestPermission() first.")
            }

            nm.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_NONE)
        }

        AsyncFunction("disableDND") {
            val nm = notificationManager
                ?: throw Exception("NotificationManager not available")

            if (!nm.isNotificationPolicyAccessGranted) {
                // Permission not granted — nothing to restore, silently return
                return@AsyncFunction
            }

            nm.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_ALL)
        }
    }
}
