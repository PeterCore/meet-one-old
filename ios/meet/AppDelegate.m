/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved./Users/xiechao/codes/meet-app/node_modules/react-native/Libraries/PushNotificationIOS/RCTPushNotification.xcodeproj
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import "SplashScreen.h"
#import <XGPush/XGPushManager.h>
#import <XGPush.h>
#import "RNUMConfigure.h"
#import <UMShare/UMShare.h>
#import <UMAnalytics/MobClick.h>
#import <Bugly/Bugly.h>
#import <React/RCTLinkingManager.h>
#import <UIKit/UIKit.h>

#define IS_STORE (NO)
#define IS_INTL (NO)

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  NSURL *jsCodeLocation;

#ifdef ARCHIVE
  jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"index.ios" withExtension:@"jsbundle"];
#else
  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#endif

  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"meet"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];

  [[UNUserNotificationCenter currentNotificationCenter] setDelegate:self];

  [SplashScreen show];  // here

  /* Umeng init */
  [RNUMConfigure initWithAppkey:IS_INTL ? @"5bac858ef1f556a220000170" : @"5ab8a0aaa40fa31b1800015a" channel:(IS_STORE || IS_INTL) ? nil : @"Offical Website"];
  [MobClick setScenarioType:E_UM_NORMAL];

  /* Share init */
  [self setupUSharePlatforms];   // required: setting platforms on demand
  [self setupUShareSettings];

  /* Bugly */
  if (IS_INTL) {
    [Bugly startWithAppId:@"b51ffe1289"];
  } else {
    [Bugly startWithAppId:@"9960799242"];
  }
  
  [self setupWebviewUA];

  return YES;
}

- (void)setupWebviewUA {
  //1）获取默认userAgent：
  UIWebView *uiwebView = [[UIWebView alloc] initWithFrame:CGRectZero];
  NSString *oldAgent = [uiwebView stringByEvaluatingJavaScriptFromString:@"navigator.userAgent"];
  
  //2）设置userAgent：添加额外的信息
  NSString *newAgent = [NSString stringWithFormat:@"%@; %@", oldAgent, @"MEET.ONE"];
  NSDictionary *dictionary = [[NSDictionary alloc] initWithObjectsAndKeys:newAgent, @"UserAgent", nil];
  [[NSUserDefaults standardUserDefaults] registerDefaults:dictionary];
}


- (void)setupUShareSettings
{
  /*
   * 打开图片水印
   */
  //[UMSocialGlobal shareInstance].isUsingWaterMark = YES;

  /*
   * 关闭强制验证https，可允许http图片分享，但需要在info.plist设置安全域名
   <key>NSAppTransportSecurity</key>
   <dict>
   <key>NSAllowsArbitraryLoads</key>
   <true/>
   </dict>
   */
  [UMSocialGlobal shareInstance].isUsingHttpsWhenShareContent = NO;

}


- (void)setupUSharePlatforms
{
  /*
   设置微信的appKey和appSecret
   [微信平台从U-Share 4/5升级说明]http://dev.umeng.com/social/ios/%E8%BF%9B%E9%98%B6%E6%96%87%E6%A1%A3#1_1
   */
  [[UMSocialManager defaultManager] setPlaform:UMSocialPlatformType_WechatSession appKey:IS_INTL ? @"wx3b346a81aedf5011" : @"wxbeef5e72e1b44938" appSecret:IS_INTL ? @"ef9e6ea3a48dfe4e15656af4644aac63" : @"f2fd69b348415e15753d427c8a8ca935" redirectURL:nil];

  /* 设置分享到QQ互联的appID
   * U-Share SDK为了兼容大部分平台命名，统一用appKey和appSecret进行参数设置，而QQ平台仅需将appID作为U-Share的appKey参数传进即可。
   100424468.no permission of union id
   [QQ/QZone平台集成说明]http://dev.umeng.com/social/ios/%E8%BF%9B%E9%98%B6%E6%96%87%E6%A1%A3#1_3
   */

  [[UMSocialManager defaultManager] setPlaform:UMSocialPlatformType_QQ appKey:IS_INTL ? @"101503931" : @"101465177"/*设置QQ平台的appID*/  appSecret:IS_INTL ? @"acf25b87f4ebc4bfa4414814b0caa11d" : @"08f2f260ea2cbe417659489155116978" redirectURL:@"https://meet.one"];

  /*
   设置新浪的appKey和appSecret
   [新浪微博集成说明]http://dev.umeng.com/social/ios/%E8%BF%9B%E9%98%B6%E6%96%87%E6%A1%A3#1_2
   */
  [[UMSocialManager defaultManager] setPlaform:UMSocialPlatformType_Sina appKey:IS_INTL ? @"241927723" : @"375111137"  appSecret:IS_INTL ? @"8720e306bcd4cf844a44d5ab1d8a0155" : @"3cc7272adaba2fa0f0269bd171c1d4b3" redirectURL:@"https://meet.one"];

  /* 设置Facebook的appKey和UrlString */
  [[UMSocialManager defaultManager] setPlaform:UMSocialPlatformType_Facebook appKey:IS_INTL ? @"182801149176159" : @"182801149176159"  appSecret:IS_INTL ? @"3d770c5475c2989cf511eb186d8af5b0" : @"3d770c5475c2989cf511eb186d8af5b0" redirectURL:@"https://meet.one"];

  /* 设置Twitter的appKey和appSecret */
  [[UMSocialManager defaultManager] setPlaform:UMSocialPlatformType_Twitter appKey:IS_INTL ? @"aWIsTsZxN2BZrhhi0a9ksNl2b" : @"aWIsTsZxN2BZrhhi0a9ksNl2b"  appSecret:IS_INTL ? @"QCuANtZGv4eiTIBjexIrjPlkKQDiIUUumJ9BZVqDxUSoyHxtGy" : @"QCuANtZGv4eiTIBjexIrjPlkKQDiIUUumJ9BZVqDxUSoyHxtGy" redirectURL:nil];
}



- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url sourceApplication:(NSString *)sourceApplication annotation:(id)annotation {
  /* Your own custom URL handlers */

  BOOL result = [[UMSocialManager defaultManager] handleOpenURL:url];
  if (!result) {
    // 其他如支付等SDK的回调
    
    result = [RCTLinkingManager application:application openURL:url sourceApplication:sourceApplication annotation:annotation];
    
    if (result) {
      ;
    }
  }
  return NO;
}


- (BOOL)application:(UIApplication *)application handleOpenURL:(NSURL *)url
{
  BOOL result = [[UMSocialManager defaultManager] handleOpenURL:url];
  if (!result) {
    // 其他如支付等SDK的回调
  }
  return result;
}

// Required to register for notifications
- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings
{
  [XGPushManager didRegisterUserNotificationSettings:notificationSettings];
}
// Required for the register event.
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  [XGPushManager didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center willPresentNotification:(UNNotification *)notification withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler
{
}

#if defined(__IPHONE_11_0)
- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)(void))completionHandler
{
}
#else
- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void(^)())completionHandler
{
}
#endif

//You can skip this method if you don't want to use local notification
-(void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification {
  [XGPushManager didReceiveLocalNotification:notification];
}

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo fetchCompletionHandler:(nonnull void (^)(UIBackgroundFetchResult))completionHandler{


  UIApplicationState state = [application applicationState];
  BOOL isClicked = (state != UIApplicationStateActive);
  NSMutableDictionary *remoteNotification = [NSMutableDictionary dictionaryWithDictionary:userInfo];
  if(isClicked) {
    remoteNotification[@"clicked"] = @YES;
  }
  [XGPushManager didReceiveRemoteNotification:remoteNotification fetchCompletionHandler:completionHandler];
  // 统计收到推送的设备
//  [XGPushManager handleReceiveNotification:remoteNotification successCallback:^{
//    NSLog(@"[XGPush] Handle receive success");
//  } errorCallback:^{
//    NSLog(@"[XGPush] Handle receive error");
//  }];
}

// Required for the registrationError event.
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
  [XGPushManager didFailToRegisterForRemoteNotificationsWithError:error];
}

@end
