package one.meet;

import android.content.Context;
import android.support.multidex.MultiDex;
import android.support.multidex.MultiDexApplication;

import com.AlexanderZaytsev.RNI18n.RNI18nPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.bitgo.randombytes.RandomBytesPackage;
import com.facebook.react.ReactApplication;
import com.rnfingerprint.FingerprintAuthPackage;
import com.rnfs.RNFSPackage;
import co.airbitz.fastcrypto.RNFastCryptoPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import io.github.airamrguez.RNMeasureTextPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.horcrux.svg.SvgPackage;
import com.imagepicker.ImagePickerPackage;
import com.jeepeng.react.xgpush.PushPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.peel.react.TcpSocketsModule;
import com.peel.react.rnos.RNOSModule;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.remobile.qrcodeLocalImage.RCTQRCodeLocalImagePackage;
import com.tradle.react.UdpSocketsModule;
import com.umeng.commonsdk.UMConfigure;
import com.umeng.socialize.PlatformConfig;
import com.umeng.socialize.bean.SHARE_MEDIA;

import org.devio.rn.splashscreen.SplashScreenReactPackage;
import org.reactnative.camera.RNCameraPackage;

import java.util.Arrays;
import java.util.List;

import fr.greweb.reactnativeviewshot.RNViewShotPackage;
import one.meet.module.DplusReactPackage;
import one.meet.module.RNUMConfigure;
import com.tencent.bugly.crashreport.CrashReport;
import com.github.wumke.RNExitApp.RNExitAppPackage;
import com.reactnativecommunity.webview.RNCWebViewPackage;

public class MainApplication extends MultiDexApplication implements ReactApplication {

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                    new MainReactPackage(),
                    new RNFSPackage(),
                    new RNFastCryptoPackage(),
                    new VectorIconsPackage(),
                    new RNMeasureTextPackage(),
                    new PickerPackage(),
                    new RNViewShotPackage(),
                    new ImagePickerPackage(),
                    new PushPackage(),
                    new RNI18nPackage(),
                    new RNDeviceInfo(),
                    new UdpSocketsModule(),
                    new TcpSocketsModule(),
                    new RNOSModule(),
                    new SplashScreenReactPackage(),
                    new RandomBytesPackage(),
                    new SvgPackage(),
                    new LinearGradientPackage(),
                    new RNCameraPackage(),
                    new DplusReactPackage(),
                    new RCTQRCodeLocalImagePackage(),
                    new RNExitAppPackage(),
                    new FingerprintAuthPackage(),
                    new RNCWebViewPackage()
            );
        }

        @Override
        protected String getJSMainModuleName() {
            return "index";
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        SoLoader.init(this, /* native exopackage */ false);
        boolean store = false;
        //初始化组件化基础库, 统计SDK/推送SDK/分享SDK都必须调用此初始化接口
        RNUMConfigure.init(this, "5ab8a047a40fa3696e0000f3", store ? "Google Play" : "Offical Website", UMConfigure.DEVICE_TYPE_PHONE,
                "bxq1wqipr2ftwnyg19xqxphqdamwdzbx");
        CrashReport.initCrashReport(getApplicationContext(), "0f12d47890", false);
    }

    @Override
    protected void attachBaseContext(Context base) {
        super.attachBaseContext(base);
        MultiDex.install(this);
    }

    // 配置平台key、secret信息
    {
        PlatformConfig.setWeixin("wxbeef5e72e1b44938", "f2fd69b348415e15753d427c8a8ca935");
        PlatformConfig.setQQZone("101465177", "08f2f260ea2cbe417659489155116978");
        PlatformConfig.setSinaWeibo("375111137", "3cc7272adaba2fa0f0269bd171c1d4b3", "meet.one");
        PlatformConfig.setTwitter("aWIsTsZxN2BZrhhi0a9ksNl2b", "QCuANtZGv4eiTIBjexIrjPlkKQDiIUUumJ9BZVqDxUSoyHxtGy");


        {
            PlatformConfig.CustomPlatform platform = (PlatformConfig.CustomPlatform) PlatformConfig.getPlatform(SHARE_MEDIA.FACEBOOK);
            platform.appId = "182801149176159";
            platform.appkey = "3d770c5475c2989cf511eb186d8af5b0";
        }
    }
}
