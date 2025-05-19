from firebase_admin import auth
from rest_framework import authentication
from rest_framework import exceptions
from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()

class FirebaseAuthentication(authentication.BaseAuthentication):
    """
    Firebase Authentication için özel bir Django REST framework authentication sınıfı.
    Bu sınıf, gelen Firebase ID token'larını doğrular ve ilgili kullanıcıyı döndürür.
    """
    
    def authenticate(self, request):
        """
        Firebase ID token'ı doğrular ve ilgili kullanıcıyı döndürür.
        Token geçerli değilse veya kullanıcı bulunamazsa None döndürür.
        """
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            return None
            
        # "Bearer " prefix'ini kaldır
        id_token = auth_header.split(' ').pop()
        if not id_token:
            return None
            
        try:
            # Firebase token'ını doğrula
            decoded_token = auth.verify_id_token(id_token)
            
            # Firebase UID'yi al
            firebase_uid = decoded_token.get('uid')
            if not firebase_uid:
                raise exceptions.AuthenticationFailed('Firebase UID bulunamadı.')
                
            # Kullanıcıyı bul veya oluştur
            try:
                user = User.objects.get(firebase_uid=firebase_uid)
            except User.DoesNotExist:
                # Yeni kullanıcı oluştur
                email = decoded_token.get('email', '')
                display_name = decoded_token.get('name', '')
                
                user = User.objects.create(
                    email=email,
                    firebase_uid=firebase_uid,
                    is_active=True
                )
                
                if display_name:
                    names = display_name.split(' ', 1)
                    user.first_name = names[0]
                    if len(names) > 1:
                        user.last_name = names[1]
                    user.save()
                    
            return (user, None)
            
        except auth.InvalidIdTokenError:
            raise exceptions.AuthenticationFailed('Geçersiz ID token.')
        except auth.ExpiredIdTokenError:
            raise exceptions.AuthenticationFailed('Süresi dolmuş ID token.')
        except auth.RevokedIdTokenError:
            raise exceptions.AuthenticationFailed('İptal edilmiş ID token.')
        except auth.CertificateFetchError:
            raise exceptions.AuthenticationFailed('Firebase sertifikası alınamadı.')
        except Exception as e:
            raise exceptions.AuthenticationFailed(f'Kimlik doğrulama hatası: {str(e)}') 