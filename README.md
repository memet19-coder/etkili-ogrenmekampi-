# Yaz Kampı Takip Uygulaması

Bu uygulama 8 haftalık yaz kampı için öğrenci takibi, haftalık kanıt kaydı, rozetler ve veli gelişim raporu hazırlamak için tasarlandı.

## Yerel kullanım

1. `index.html` dosyasını tarayıcıda aç.
2. Öğrencileri ekle.
3. Her hafta `Haftalık Takip` bölümünden kayıtları doldur.
4. `Veli Raporu` bölümünden raporu kontrol et ve yazdır.
5. `Yedek` bölümünden düzenli olarak JSON yedeği indir.

Veriler tarayıcının yerel hafızasında saklanır. Bilgisayar veya tarayıcı değiştirmeden önce JSON yedeği almak gerekir.

## GitHub'a koyma

Bu klasör statik bir web uygulamasıdır. GitHub Pages ile yayınlanabilir.

```bash
git init
git add .
git commit -m "Yaz kampi takip uygulamasi"
git branch -M main
git remote add origin GITHUB_REPO_ADRESI
git push -u origin main
```

GitHub repo ayarlarından Pages bölümünde kaynak olarak `main` ve klasör olarak `/root` seçilebilir.

## Veri güvenliği

Öğrenci bilgileri hassas veri sayılabilir. GitHub'a uygulama dosyalarını koymak uygundur; ancak indirilen JSON yedeklerini herkese açık repoya yüklememek gerekir.
