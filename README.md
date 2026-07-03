# Yaz Kampi Takip Uygulamasi

Bu uygulama 8 haftalik yaz kampi icin ogrenci takibi, haftalik kanit kaydi, rozetler ve veli gelisim raporu hazirlamak icin tasarlandi.

## Yerel kullanim

1. `index.html` dosyasini tarayicida ac.
2. Ogrencileri ekle.
3. Her hafta `Haftalik Takip` bolumunden kayitlari doldur.
4. `Veli Raporu` bolumunden raporu kontrol et ve yazdir.
5. `Yedek` bolumunden duzenli olarak JSON yedegi indir.

Veriler tarayicinin yerel hafizasinda saklanir. Bilgisayar veya tarayici degistirmeden once JSON yedegi almak gerekir.

## GitHub'a koyma

Bu klasor statik bir web uygulamasidir. GitHub Pages ile yayinlanabilir.

```bash
git init
git add .
git commit -m "Yaz kampi takip uygulamasi"
git branch -M main
git remote add origin GITHUB_REPO_ADRESI
git push -u origin main
```

GitHub repo ayarlarindan Pages bolumunde kaynak olarak `main` ve klasor olarak `/root` secilebilir.

## Veri guvenligi

Ogrenci bilgileri hassas veri sayilabilir. GitHub'a uygulama dosyalarini koymak uygundur; ancak indirilen JSON yedeklerini herkese acik repoya yuklememek gerekir.
