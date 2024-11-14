#import "NotificationService.h"
#import <CommonCrypto/CommonCryptor.h>

@interface NotificationService ()

@property (nonatomic, strong) void (^contentHandler)(UNNotificationContent *contentToDeliver);
@property (nonatomic, strong) UNNotificationRequest *receivedRequest;
@property (nonatomic, strong) UNMutableNotificationContent *bestAttemptContent;

@end

@implementation NotificationService

NSData* dataFromHexString(NSString *hexString) {
  NSMutableData *data = [NSMutableData data];
  int idx;
  for (idx = 0; idx+2 <= hexString.length; idx+=2) {
    NSRange range = NSMakeRange(idx, 2);
    NSString *hexByte = [hexString substringWithRange:range];
    unsigned int byte;
    if ([[NSScanner scannerWithString:hexByte] scanHexInt:&byte]) {
      [data appendBytes:&byte length:1];
    } else {
      return nil;
    }
  }
  return data;
}

- (void)didReceiveNotificationRequest:(UNNotificationRequest *)request withContentHandler:(void (^)(UNNotificationContent * _Nonnull))contentHandler {
  self.receivedRequest = request;
  self.contentHandler = contentHandler;
  self.bestAttemptContent = [request.content mutableCopy];

  NSDictionary *userInfo = request.content.userInfo;
  if (!userInfo) {
    self.contentHandler(nil);
    return;
  }

  NSDictionary *bodyDict = userInfo[@"body"];
  if (!bodyDict) {
    self.contentHandler(nil);
    return;
  }

  NSString *appPubkey = bodyDict[@"appPubkey"];
  if (!appPubkey) {
    self.contentHandler(nil);
    return;
  }

  NSString *encryptedContent = bodyDict[@"content"];
  if (!encryptedContent) {
    self.contentHandler(nil);
    return;
  }

  NSUserDefaults *sharedDefaults = [[NSUserDefaults alloc] initWithSuiteName:@"group.com.getalby.mobile.nse"];
  NSDictionary *walletsDict = [sharedDefaults objectForKey:@"wallets"];
  if (!walletsDict) {
    self.contentHandler(nil);
    return;
  }

  NSDictionary *walletInfo = walletsDict[appPubkey];
  if (!walletInfo) {
    self.contentHandler(nil);
    return;
  }

  NSString *sharedSecretString = walletInfo[@"sharedSecret"];
  NSString *walletName = walletInfo[@"name"];
  if (!walletName) {
    walletName = @"Alby Go";
  }

  if (!sharedSecretString) {
    self.contentHandler(nil);
    return;
  }

  NSData *sharedSecretData = dataFromHexString(sharedSecretString);
  if (!sharedSecretData || sharedSecretData.length != kCCKeySizeAES256) {
    self.contentHandler(nil);
    return;
  }

  NSArray *parts = [encryptedContent componentsSeparatedByString:@"?iv="];
  if (parts.count < 2) {
    self.contentHandler(nil);
    return;
  }

  NSString *ciphertextBase64 = parts[0];
  NSString *ivBase64 = parts[1];

  NSData *ciphertextData = [[NSData alloc] initWithBase64EncodedString:ciphertextBase64 options:0];
  NSData *ivData = [[NSData alloc] initWithBase64EncodedString:ivBase64 options:0];
  
  if (!ciphertextData || !ivData || ivData.length != kCCBlockSizeAES128) {
    self.contentHandler(nil);
    return;
  }

  size_t decryptedDataLength = ciphertextData.length + kCCBlockSizeAES128;
  NSMutableData *plaintextData = [NSMutableData dataWithLength:decryptedDataLength];
  
  size_t numBytesDecrypted = 0;
  CCCryptorStatus cryptStatus = CCCrypt(kCCDecrypt, kCCAlgorithmAES128, kCCOptionPKCS7Padding, sharedSecretData.bytes, sharedSecretData.length, ivData.bytes, ciphertextData.bytes, ciphertextData.length, plaintextData.mutableBytes, decryptedDataLength, &numBytesDecrypted);

  if (cryptStatus != kCCSuccess) {
    self.contentHandler(nil);
    return;
  }

  plaintextData.length = numBytesDecrypted;

  NSError *jsonError = nil;
  NSDictionary *parsedContent = [NSJSONSerialization JSONObjectWithData:plaintextData options:0 error:&jsonError];

  if (!parsedContent || jsonError) {
    self.contentHandler(nil);
    return;
  }

  NSString *notificationType = parsedContent[@"notification_type"];
  if (![notificationType isEqualToString:@"payment_received"]) {
    self.contentHandler(nil);
    return;
  }

  NSDictionary *notificationDict = parsedContent[@"notification"];
  NSNumber *amountNumber = notificationDict[@"amount"];
  if (!amountNumber) {
    self.contentHandler(nil);
    return;
  }

  double amountInSats = [amountNumber doubleValue] / 1000.0;
  self.bestAttemptContent.title = walletName;
  self.bestAttemptContent.body = [NSString stringWithFormat:@"You just received %.0f sats ⚡️", amountInSats];
  self.contentHandler(self.bestAttemptContent);
}

- (void)serviceExtensionTimeWillExpire {
  self.bestAttemptContent.body = @"expired notification";
  self.contentHandler(self.bestAttemptContent);
}

@end
