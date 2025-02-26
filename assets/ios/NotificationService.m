#import "NotificationService.h"
#import <CommonCrypto/CommonCryptor.h>
#import <openssl/evp.h>
#import <openssl/hmac.h>
#import <openssl/kdf.h>

@interface NotificationService ()

@property (nonatomic, strong) void (^contentHandler)(UNNotificationContent *contentToDeliver);
@property (nonatomic, strong) UNNotificationRequest *receivedRequest;
@property (nonatomic, strong) UNMutableNotificationContent *bestAttemptContent;

@end

@implementation NotificationService

- (void)didReceiveNotificationRequest:(UNNotificationRequest *)request withContentHandler:(void (^)(UNNotificationContent * _Nonnull))contentHandler {
    self.receivedRequest    = request;
    self.contentHandler     = contentHandler;
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

    // Fetch wallet pubkey and content from notification
    NSString *appPubkey        = bodyDict[@"appPubkey"];
    NSString *encryptedContent = bodyDict[@"content"];
    if (!appPubkey || !encryptedContent) {
        self.contentHandler(nil);
        return;
    }

    // Fetch stored wallet info using the pubkey
    NSUserDefaults *sharedDefaults = [[NSUserDefaults alloc] initWithSuiteName:@"group.com.getalby.mobile.nse"];
    NSDictionary *walletsDict      = [sharedDefaults objectForKey:@"wallets"];
    if (!walletsDict) {
        self.contentHandler(nil);
        return;
    }

    NSDictionary *walletInfo       = walletsDict[appPubkey];
    if (!walletInfo) {
        self.contentHandler(nil);
        return;
    }

    NSString *sharedSecretString = walletInfo[@"sharedSecret"];
    NSString *walletName         = walletInfo[@"name"] ?: @"Alby Go";
    NSNumber *walletId           = walletInfo[@"id"];
    NSString *walletVersion      = walletInfo[@"version"] ?: @"0.0";
    if (!sharedSecretString || !walletId) {
        self.contentHandler(nil);
        return;
    }

    NSData *decryptedData = nil;
    if ([walletVersion isEqualToString:@"1.0"]) {
      // Decrypt using NIP-44
      decryptedData = Nip44Decrypt(sharedSecretString, encryptedContent);
    } else {
      // Decrypt using NIP-04
      decryptedData = Nip04Decrypt(sharedSecretString, encryptedContent);
    }

    if (!decryptedData) {
        self.contentHandler(nil);
        return;
    }

    // Parse JSON from decrypted data
    NSError *jsonError = nil;
    NSDictionary *parsedContent = [NSJSONSerialization JSONObjectWithData:decryptedData
                                                                  options:0
                                                                    error:&jsonError];
    if (!parsedContent || jsonError) {
        self.contentHandler(nil);
        return;
    }

    // Check the notification type
    NSString *notificationType = parsedContent[@"notification_type"];
    if (![notificationType isEqualToString:@"payment_sent"] &&
        ![notificationType isEqualToString:@"payment_received"]) {
        self.contentHandler(nil);
        return;
    }

    NSDictionary *notificationDict = parsedContent[@"notification"];
    NSNumber *amountNumber         = notificationDict[@"amount"];
    if (!amountNumber) {
        self.contentHandler(nil);
        return;
    }

    NSError *transactionError  = nil;
    NSData *transactionData    = [NSJSONSerialization dataWithJSONObject:notificationDict
                                                                 options:0
                                                                   error:&transactionError];
    if (transactionError || !transactionData) {
        self.contentHandler(nil);
        return;
    }

    NSString *transactionJSON    = [[NSString alloc] initWithData:transactionData encoding:NSUTF8StringEncoding];
    NSString *encodedTransaction = [transactionJSON stringByAddingPercentEncodingWithAllowedCharacters:[NSCharacterSet URLQueryAllowedCharacterSet]];
    if (!encodedTransaction) {
        self.contentHandler(nil);
        return;
    }

    double amountInSats = [amountNumber doubleValue] / 1000.0;
    NSString *deepLink  = [NSString stringWithFormat:@"alby://payment_notification?transaction=%@&wallet_id=%@", encodedTransaction,
                                  walletId.stringValue];

    NSMutableDictionary *newUserInfo = [self.bestAttemptContent.userInfo mutableCopy] ?: [NSMutableDictionary dictionary];
    NSMutableDictionary *newBodyDict = [newUserInfo[@"body"] mutableCopy] ?: [NSMutableDictionary dictionary];

    newBodyDict[@"deepLink"]         = deepLink;
    newUserInfo[@"body"]             = newBodyDict;
    self.bestAttemptContent.userInfo = newUserInfo;
    self.bestAttemptContent.title    = walletName;

    if ([notificationType isEqualToString:@"payment_sent"]) {
        self.bestAttemptContent.body = [NSString stringWithFormat:@"You sent %.0f sats ⚡️", amountInSats];
    } else {
        self.bestAttemptContent.body = [NSString stringWithFormat:@"You received %.0f sats ⚡️", amountInSats];
    }

    self.contentHandler(self.bestAttemptContent);
}

- (void)serviceExtensionTimeWillExpire {
    self.bestAttemptContent.body = @"expired notification";
    self.contentHandler(self.bestAttemptContent);
}

/// Decrypts a NIP-44–style message using the given conversation key (in hex format).
/// - Parameters:
///   - conversationKeyHex: The conversation key in hex (32 bytes => 64 hex chars).
///   - encryptedMessage: The base64-encoded ciphertext, which includes:
///       1 byte version, 32-byte nonce, variable-length ciphertext, 32-byte HMAC.
/// - Returns: Decrypted data on success, or `nil` on failure.
static NSData *Nip44Decrypt(NSString *conversationKeyHex, NSString *encryptedMessage) {
    NSData *conversationKeyData = DataFromHexString(conversationKeyHex);
    if (!conversationKeyData || conversationKeyData.length != 32) {
        return nil;
    }

    NSData *decoded = [[NSData alloc] initWithBase64EncodedString:encryptedMessage options:0];
    if (!decoded || decoded.length < 99 || decoded.length > 65603) {
        return nil;
    }

    const unsigned char *bytes = (const unsigned char *)decoded.bytes;

    if (bytes[0] != 2) {
        return nil;
    }

    size_t totalLen = decoded.length;
    if (totalLen < (1 + 32 + 32)) {
        return nil;
    }

    NSData *nonce     = [decoded subdataWithRange:NSMakeRange(1, 32)];
    size_t hmacOffset = decoded.length - 32;
    NSData *ciphertext = [decoded subdataWithRange:NSMakeRange(1 + 32, hmacOffset - (1 + 32))];
    NSData *givenMac   = [decoded subdataWithRange:NSMakeRange(hmacOffset, 32)];

    unsigned char hkdfOutput[76];
    size_t hkdfLength = sizeof(hkdfOutput);
    EVP_PKEY_CTX *pctx = EVP_PKEY_CTX_new_id(EVP_PKEY_HKDF, NULL);

    if (!pctx ||
        EVP_PKEY_derive_init(pctx) <= 0 ||
        EVP_PKEY_CTX_set_hkdf_mode(pctx, EVP_PKEY_HKDEF_MODE_EXPAND_ONLY) <= 0 ||
        EVP_PKEY_CTX_set_hkdf_md(pctx, EVP_sha256()) <= 0 ||
        EVP_PKEY_CTX_set1_hkdf_key(pctx, conversationKeyData.bytes, (int)conversationKeyData.length) <= 0 ||
        EVP_PKEY_CTX_add1_hkdf_info(pctx, nonce.bytes, (int)nonce.length) <= 0 ||
        EVP_PKEY_derive(pctx, hkdfOutput, &hkdfLength) <= 0 ||
        hkdfLength != 76) {

        EVP_PKEY_CTX_free(pctx);
        return nil;
    }
    EVP_PKEY_CTX_free(pctx);

    NSData *cc20Key   = [NSData dataWithBytes:hkdfOutput        length:32];
    NSData *cc20Nonce = [NSData dataWithBytes:hkdfOutput + 32   length:12];
    NSData *hmacKey   = [NSData dataWithBytes:hkdfOutput + 44   length:32];

    unsigned char macBuf[EVP_MAX_MD_SIZE];
    unsigned int macLen = 0;
    
    HMAC_CTX *hmacCtx = HMAC_CTX_new();
    if (!hmacCtx ||
        HMAC_Init_ex(hmacCtx, hmacKey.bytes, (int)hmacKey.length, EVP_sha256(), NULL) != 1 ||
        HMAC_Update(hmacCtx, nonce.bytes, (int)nonce.length) != 1 ||
        HMAC_Update(hmacCtx, ciphertext.bytes, (int)ciphertext.length) != 1 ||
        HMAC_Final(hmacCtx, macBuf, &macLen) != 1 || macLen != 32 ||
        memcmp(macBuf, givenMac.bytes, 32) != 0) {
        
        HMAC_CTX_free(hmacCtx);
        return nil;
    }
    HMAC_CTX_free(hmacCtx);

    uint8_t iv[16];
    memset(iv, 0, 4);
    memcpy(iv + 4, cc20Nonce.bytes, 12);
    
    EVP_CIPHER_CTX *ctx = EVP_CIPHER_CTX_new();
    if (!ctx) {
        return nil;
    }
    
    if (EVP_DecryptInit_ex(ctx, EVP_chacha20(), NULL, cc20Key.bytes, iv) != 1) {
        EVP_CIPHER_CTX_free(ctx);
        return nil;
    }
    
    NSMutableData *plainMutable = [NSMutableData dataWithLength:ciphertext.length];
    int outl = 0;
    if (EVP_DecryptUpdate(ctx,
                          plainMutable.mutableBytes,
                          &outl,
                          ciphertext.bytes,
                          (int)ciphertext.length) != 1) {
        EVP_CIPHER_CTX_free(ctx);
        return nil;
    }

    int final_outl = 0;
    if (EVP_DecryptFinal_ex(ctx,
                            (unsigned char *)plainMutable.mutableBytes + outl,
                            &final_outl) != 1) {
        EVP_CIPHER_CTX_free(ctx);
        return nil;
    }
    EVP_CIPHER_CTX_free(ctx);
    
    [plainMutable setLength:(outl + final_outl)];

    if (plainMutable.length < 2) {
        return nil;
    }
    
    const unsigned char *pBytes = plainMutable.bytes;
    uint16_t unpaddedLen = ((uint16_t)pBytes[0] << 8) | (uint16_t)pBytes[1];
    
    if (unpaddedLen < 1 ||
        unpaddedLen > 65535 ||
        (2 + unpaddedLen) > plainMutable.length) {
        return nil;
    }
    
    NSData *plaintext = [plainMutable subdataWithRange:NSMakeRange(2, unpaddedLen)];
    return plaintext;
}

/// Decrypts a NIP-04–style message using the given shared secret (in hex format).
/// - Parameters:
///   - sharedSecretHex: The shared secret in hex format, must be AES-256 length (64 hex chars).
///   - encryptedMessage: The encrypted message, typically in `ciphertextBase64?iv=ivBase64` format.
/// - Returns: Decrypted data on success, or `nil` on failure.
static NSData *Nip04Decrypt(NSString *sharedSecretHex, NSString *encryptedMessage) {
    NSData *sharedSecretData = DataFromHexString(sharedSecretHex);
    if (!sharedSecretData || sharedSecretData.length != kCCKeySizeAES256) {
        return nil;
    }

    NSArray<NSString *> *parts = [encryptedMessage componentsSeparatedByString:@"?iv="];
    if (parts.count < 2) {
        return nil;
    }

    NSString *ciphertextBase64 = parts.firstObject;
    NSString *ivBase64         = parts.lastObject;

    NSData *ciphertextData = [[NSData alloc] initWithBase64EncodedString:ciphertextBase64 options:0];
    NSData *ivData         = [[NSData alloc] initWithBase64EncodedString:ivBase64 options:0];

    if (!ciphertextData || !ivData || ivData.length != kCCBlockSizeAES128) {
        return nil;
    }

    size_t decryptedDataLength = ciphertextData.length + kCCBlockSizeAES128;
    NSMutableData *plaintextData = [NSMutableData dataWithLength:decryptedDataLength];

    size_t numBytesDecrypted = 0;
    CCCryptorStatus cryptStatus = CCCrypt(kCCDecrypt,
                                          kCCAlgorithmAES128,
                                          kCCOptionPKCS7Padding,
                                          sharedSecretData.bytes,
                                          sharedSecretData.length,
                                          ivData.bytes,
                                          ciphertextData.bytes,
                                          ciphertextData.length,
                                          plaintextData.mutableBytes,
                                          decryptedDataLength,
                                          &numBytesDecrypted);

    if (cryptStatus != kCCSuccess) {
        return nil;
    }

    plaintextData.length = numBytesDecrypted;
    return plaintextData;
}

static NSData *DataFromHexString(NSString *hexString) {
    if (!hexString) {
        return nil;
    }
    NSMutableData *data = [NSMutableData data];
    for (NSInteger idx = 0; idx + 2 <= hexString.length; idx += 2) {
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

@end
