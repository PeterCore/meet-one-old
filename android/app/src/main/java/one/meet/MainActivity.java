package one.meet;

import android.content.Intent;
import android.os.Bundle;

import com.facebook.react.ReactActivity;
import com.umeng.socialize.UMShareAPI;

import org.devio.rn.splashscreen.SplashScreen;

import one.meet.module.ShareModule;
import com.umeng.analytics.MobclickAgent;
import com.umeng.analytics.MobclickAgent.EScenarioType;

// react-native-splash-screen >= 0.3.1

public class MainActivity extends ReactActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen.show(this, true);  // here
        super.onCreate(savedInstanceState);

        ShareModule.initSocialSDK(this);
        MobclickAgent.setSessionContinueMillis(1000);
        MobclickAgent.setScenarioType(this, EScenarioType.E_DUM_NORMAL);
    }

    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
    }

    @Override
    public void onResume() {
        super.onResume();
        MobclickAgent.onResume(this);
    }
    @Override
    protected void onPause() {
        super.onPause();
        MobclickAgent.onPause(this);
    }

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "meet";
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        UMShareAPI.get(this).onActivityResult(requestCode, resultCode, data);
    }
}
