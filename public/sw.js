if(!self.define){let e,i={};const a=(a,s)=>(a=new URL(a+".js",s).href,i[a]||new Promise((i=>{if("document"in self){const e=document.createElement("script");e.src=a,e.onload=i,document.head.appendChild(e)}else e=a,importScripts(a),i()})).then((()=>{let e=i[a];if(!e)throw new Error(`Module ${a} didn’t register its module`);return e})));self.define=(s,n)=>{const r=e||("document"in self?document.currentScript.src:"")||location.href;if(i[r])return;let o={};const c=e=>a(e,r),d={module:{uri:r},exports:o,require:c};i[r]=Promise.all(s.map((e=>d[e]||c(e)))).then((e=>(n(...e),o)))}}define(["./workbox-07a7b4f2"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/app-build-manifest.json",revision:"76c33df9b546c1337377015650e00eb1"},{url:"/_next/static/chunks/310-0a2df2e594bd793b.js",revision:"r6hv0LkOL_jytAteARuiL"},{url:"/_next/static/chunks/409-cea2ee4d57f1d709.js",revision:"r6hv0LkOL_jytAteARuiL"},{url:"/_next/static/chunks/452-2712ecc700908dc2.js",revision:"r6hv0LkOL_jytAteARuiL"},{url:"/_next/static/chunks/472-18a534e03f80b01b.js",revision:"r6hv0LkOL_jytAteARuiL"},{url:"/_next/static/chunks/49-3bf7b8b914c9f3bb.js",revision:"r6hv0LkOL_jytAteARuiL"},{url:"/_next/static/chunks/691-84ed6cb4e5027e3b.js",revision:"r6hv0LkOL_jytAteARuiL"},{url:"/_next/static/chunks/76-129b995d0e2bdb71.js",revision:"r6hv0LkOL_jytAteARuiL"},{url:"/_next/static/chunks/8e1d74a4-65a5d740ae2c464e.js",revision:"r6hv0LkOL_jytAteARuiL"},{url:"/_next/static/chunks/app/_not-found-a107b0afa67ce5f5.js",revision:"r6hv0LkOL_jytAteARuiL"},{url:"/_next/static/chunks/app/about/layout-b9b102ad13251125.js",revision:"r6hv0LkOL_jytAteARuiL"},{url:"/_next/static/chunks/app/about/page-67ddc31336eb0eea.js",revision:"r6hv0LkOL_jytAteARuiL"},{url:"/_next/static/chunks/app/clubs/layout-9caa3302c73f3071.js",revision:"r6hv0LkOL_jytAteARuiL"},{url:"/_next/static/chunks/app/clubs/page-51f7246f822a0767.js",revision:"r6hv0LkOL_jytAteARuiL"},{url:"/_next/static/chunks/app/error-7eefc337595a47f8.js",revision:"r6hv0LkOL_jytAteARuiL"},{url:"/_next/static/chunks/app/layout-7382a70229cfb600.js",revision:"r6hv0LkOL_jytAteARuiL"},{url:"/_next/static/chunks/app/page-f9b48f72ead25953.js",revision:"r6hv0LkOL_jytAteARuiL"},{url:"/_next/static/chunks/app/studygroups/layout-d17a542eb6958211.js",revision:"r6hv0LkOL_jytAteARuiL"},{url:"/_next/static/chunks/app/studygroups/page-6e5921167b2c1e66.js",revision:"r6hv0LkOL_jytAteARuiL"},{url:"/_next/static/chunks/fd9d1056-457a8107954bcc1e.js",revision:"r6hv0LkOL_jytAteARuiL"},{url:"/_next/static/chunks/framework-8883d1e9be70c3da.js",revision:"r6hv0LkOL_jytAteARuiL"},{url:"/_next/static/chunks/main-app-53849d4e649d1b44.js",revision:"r6hv0LkOL_jytAteARuiL"},{url:"/_next/static/chunks/main-e25b69aebcd24560.js",revision:"r6hv0LkOL_jytAteARuiL"},{url:"/_next/static/chunks/pages/_app-ee276fea40a4b191.js",revision:"r6hv0LkOL_jytAteARuiL"},{url:"/_next/static/chunks/pages/_error-deeb844d2074b9d8.js",revision:"r6hv0LkOL_jytAteARuiL"},{url:"/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js",revision:"837c0df77fd5009c9e46d446188ecfd0"},{url:"/_next/static/chunks/webpack-e623fc05d1f26820.js",revision:"r6hv0LkOL_jytAteARuiL"},{url:"/_next/static/css/38ba31662edf2fc3.css",revision:"38ba31662edf2fc3"},{url:"/_next/static/css/67d91588a194fecb.css",revision:"67d91588a194fecb"},{url:"/_next/static/css/db8e53e5bdcb4b71.css",revision:"db8e53e5bdcb4b71"},{url:"/_next/static/media/05a31a2ca4975f99-s.woff2",revision:"f1b44860c66554b91f3b1c81556f73ca"},{url:"/_next/static/media/122c360d7fe6d395-s.p.woff2",revision:"9b2795fb691d8f8a83312a4436f5a453"},{url:"/_next/static/media/513657b02c5c193f-s.woff2",revision:"c4eb7f37bc4206c901ab08601f21f0f2"},{url:"/_next/static/media/51ed15f9841b9f9d-s.woff2",revision:"bb9d99fb9bbc695be80777ca2c1c2bee"},{url:"/_next/static/media/9bbb7f84f3601865-s.woff2",revision:"d8134b7ae9ca2232a397ef9afa6c8d30"},{url:"/_next/static/media/9f05b6a2725a7318-s.woff2",revision:"afbfd524bdefea1003f0ee71b617e50e"},{url:"/_next/static/media/a8eac78432f0a60b-s.woff2",revision:"be605f007472cc947fe6b6bb493228a5"},{url:"/_next/static/media/apa.6021d8fd.jpg",revision:"04f72f6d642e0e7be5d836a1a4c27a1d"},{url:"/_next/static/media/c740c1d45290834f-s.woff2",revision:"bff99a4bbc4740c49b75b52f290be90e"},{url:"/_next/static/media/c9a5bc6a7c948fb0-s.p.woff2",revision:"74c3556b9dad12fb76f84af53ba69410"},{url:"/_next/static/media/d0697bdd3fb49a78-s.woff2",revision:"50b29fea20cba8e522c34a1413592253"},{url:"/_next/static/media/d6b16ce4a6175f26-s.woff2",revision:"dd930bafc6297347be3213f22cc53d3e"},{url:"/_next/static/media/ec159349637c90ad-s.woff2",revision:"0e89df9522084290e01e4127495fae99"},{url:"/_next/static/media/fd4db3eb5472fc27-s.woff2",revision:"71f3fcaf22131c3368d9ec28ef839831"},{url:"/_next/static/r6hv0LkOL_jytAteARuiL/_buildManifest.js",revision:"39c04c408085e9912adc25c833c9fca1"},{url:"/_next/static/r6hv0LkOL_jytAteARuiL/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/android/android-launchericon-144-144.png",revision:"8d9630bb128997da924f2f220d4673d1"},{url:"/android/android-launchericon-192-192.png",revision:"a5bb3d561df01f7e1326dc3b3d34f142"},{url:"/android/android-launchericon-48-48.png",revision:"f8f5a2bb31c478a288bbc59068bae2c5"},{url:"/android/android-launchericon-512-512.png",revision:"0c585f72b3c1188814c010a08029fe86"},{url:"/android/android-launchericon-72-72.png",revision:"b7120e3246019a9d060c43a1303803d6"},{url:"/android/android-launchericon-96-96.png",revision:"3320c6294790d8fe7b1dda07d2f13867"},{url:"/apa.jpg",revision:"04f72f6d642e0e7be5d836a1a4c27a1d"},{url:"/favicon.ico",revision:"c30c7d42707a47a3f4591831641e50dc"},{url:"/groups/zoldbiz.png",revision:"5cf4cc264201d773e7b163533fe6ddf9"},{url:"/groups/zoldbiz1.jpg",revision:"512d47f10662759c9c5d507c3827b841"},{url:"/icons.json",revision:"5dbbc3fe59816e65ba28e355a58ea45c"},{url:"/ios/100.png",revision:"c492f77bf207439add279c3fbfaaee42"},{url:"/ios/1024.png",revision:"bd97c0da9028a23ef31277e2c1cea3b3"},{url:"/ios/114.png",revision:"b5545d30db224f898eaabc7792f1e909"},{url:"/ios/120.png",revision:"27987646b3fde5b9f4c142d37b3088d9"},{url:"/ios/128.png",revision:"f79c48bf6e3b98d9d83ee17cc6662237"},{url:"/ios/144.png",revision:"4f3675c1d17a21e7281f59eab3c3316f"},{url:"/ios/152.png",revision:"e5605301608cd3bf158d416809a32ee4"},{url:"/ios/16.png",revision:"6283fcad7289a9f8dc3499e70e64dc4c"},{url:"/ios/167.png",revision:"519a1ebbe3a1f1978c5a1f76d7bcad1b"},{url:"/ios/180.png",revision:"3323e3f6245042f262c48ffb225af937"},{url:"/ios/192.png",revision:"b1431191e31ef37fcd92a07043124e71"},{url:"/ios/20.png",revision:"9b655735dd0cd501804bf1902eaff0a9"},{url:"/ios/256.png",revision:"829897665f1b1b9a3c646f42b7ac1aa0"},{url:"/ios/29.png",revision:"574efcb378179e4c1b03c95b10a08272"},{url:"/ios/32.png",revision:"cd9f8c688a849bab9e24b358509ff210"},{url:"/ios/40.png",revision:"747e3122a9db3815a00e330ac87cb6dc"},{url:"/ios/50.png",revision:"bca4fc8920dc3fa21d6a555cf46502e5"},{url:"/ios/512.png",revision:"32257bf316d03029dfc69e475ea8c5f9"},{url:"/ios/57.png",revision:"6b508da9ed53c80cb738c3c6b5ce5a0e"},{url:"/ios/58.png",revision:"7ab5d6b2e47ef5836585d10d53db86ce"},{url:"/ios/60.png",revision:"6eacb1a70ce6a5f6bd5acf4eddf1c718"},{url:"/ios/64.png",revision:"d97c9bed3288cb3787b33dbfe0e7bdfc"},{url:"/ios/72.png",revision:"9b49b2a9f92861eea9f753cd3bd1fad2"},{url:"/ios/76.png",revision:"aec4ee5a1f78eee6adaae1bbc9075194"},{url:"/ios/80.png",revision:"059e67016a5d9d32cc078cd4b05d1049"},{url:"/ios/87.png",revision:"bf62601279d06ff641f21496293011d0"},{url:"/manifest.json",revision:"d30e03549c8b6b670af1313124f462a2"},{url:"/next.svg",revision:"8e061864f388b47f33a1c3780831193e"},{url:"/opinion.png",revision:"4cd5f03c0e9cfb37c6c6504a578d29a8"},{url:"/opinion1.png",revision:"23ddcf4b2eba55c20b24f8446feeb980"},{url:"/vercel.svg",revision:"61c6b19abff40ea7acd577be818f3976"},{url:"/windows11/LargeTile.scale-100.png",revision:"a09f8d0d0186725706f709135e4bd9b6"},{url:"/windows11/LargeTile.scale-125.png",revision:"24e0df3769b7a84020d65513728a7f77"},{url:"/windows11/LargeTile.scale-150.png",revision:"57b5f43d7e44e284b328050027bbd76c"},{url:"/windows11/LargeTile.scale-200.png",revision:"6413cd833ebec70fd1c48af9b72f2593"},{url:"/windows11/LargeTile.scale-400.png",revision:"9d714d06ce0f75841bfc366b2c55a418"},{url:"/windows11/SmallTile.scale-100.png",revision:"1ce5eda2e8c613d5d2f3d10c6c655e8d"},{url:"/windows11/SmallTile.scale-125.png",revision:"ff76aa8cece5212c92b182362369ff34"},{url:"/windows11/SmallTile.scale-150.png",revision:"5462280326b6f37f2516cb48fa91c500"},{url:"/windows11/SmallTile.scale-200.png",revision:"14bb4a7224e07071ce942ffcf550019d"},{url:"/windows11/SmallTile.scale-400.png",revision:"f5677dc6dfd72a4a1cc65d61b65cbf4a"},{url:"/windows11/SplashScreen.scale-100.png",revision:"c5567950d19a10982f7d526200bab523"},{url:"/windows11/SplashScreen.scale-125.png",revision:"9a55aa133f6f227c6db844f9217185e9"},{url:"/windows11/SplashScreen.scale-150.png",revision:"069e14f74c193c49d4866b6c71782272"},{url:"/windows11/SplashScreen.scale-200.png",revision:"2f13d96d3bf5da5df927c7d9f4cd3758"},{url:"/windows11/SplashScreen.scale-400.png",revision:"103eb6c6ee2b68c4c552d43f0bc81521"},{url:"/windows11/Square150x150Logo.scale-100.png",revision:"3df8d1cd26bf8b49949c7d4efe0c5165"},{url:"/windows11/Square150x150Logo.scale-125.png",revision:"c7df8f0d838a0762370b72acd6c46cf1"},{url:"/windows11/Square150x150Logo.scale-150.png",revision:"93e69bb5574074d8af119624c83ff5db"},{url:"/windows11/Square150x150Logo.scale-200.png",revision:"eb8a6e44899199b3432947432e526047"},{url:"/windows11/Square150x150Logo.scale-400.png",revision:"55681d992e9792096c82cb00dbf3484f"},{url:"/windows11/Square44x44Logo.altform-lightunplated_targetsize-16.png",revision:"485f06107ae56112d68a758bff2c2606"},{url:"/windows11/Square44x44Logo.altform-lightunplated_targetsize-20.png",revision:"7061557fa78e057e3d68551d363923c5"},{url:"/windows11/Square44x44Logo.altform-lightunplated_targetsize-24.png",revision:"97c2baf751cd95c664fdc8f76a4c877c"},{url:"/windows11/Square44x44Logo.altform-lightunplated_targetsize-256.png",revision:"3044af5d2db7b03fd4c613dc105d5897"},{url:"/windows11/Square44x44Logo.altform-lightunplated_targetsize-30.png",revision:"8b5784db4b3c3265ff5e35dc9500d9ea"},{url:"/windows11/Square44x44Logo.altform-lightunplated_targetsize-32.png",revision:"ce8857c0f319077aea27078df7e7aeb6"},{url:"/windows11/Square44x44Logo.altform-lightunplated_targetsize-36.png",revision:"8cd98b198626461b151c4b5370e20473"},{url:"/windows11/Square44x44Logo.altform-lightunplated_targetsize-40.png",revision:"8cee229e6bdc29227235af0513c9017e"},{url:"/windows11/Square44x44Logo.altform-lightunplated_targetsize-44.png",revision:"6a1078c93444fbbdeed57e3cb6275195"},{url:"/windows11/Square44x44Logo.altform-lightunplated_targetsize-48.png",revision:"ef61c479f5b89e53b466d96b896004d1"},{url:"/windows11/Square44x44Logo.altform-lightunplated_targetsize-60.png",revision:"0b2e4c26edc535eb5bdaf59903454ce5"},{url:"/windows11/Square44x44Logo.altform-lightunplated_targetsize-64.png",revision:"fad8a8d91b69069dabaa8340229c8d4d"},{url:"/windows11/Square44x44Logo.altform-lightunplated_targetsize-72.png",revision:"70a62d816cc460ab7f7cd7d8a6e110d0"},{url:"/windows11/Square44x44Logo.altform-lightunplated_targetsize-80.png",revision:"a08a7078f1de1cd987912c13c85c77ea"},{url:"/windows11/Square44x44Logo.altform-lightunplated_targetsize-96.png",revision:"242a35f3a93d35e22c0f056bbe093bf1"},{url:"/windows11/Square44x44Logo.altform-unplated_targetsize-16.png",revision:"485f06107ae56112d68a758bff2c2606"},{url:"/windows11/Square44x44Logo.altform-unplated_targetsize-20.png",revision:"7061557fa78e057e3d68551d363923c5"},{url:"/windows11/Square44x44Logo.altform-unplated_targetsize-24.png",revision:"97c2baf751cd95c664fdc8f76a4c877c"},{url:"/windows11/Square44x44Logo.altform-unplated_targetsize-256.png",revision:"3044af5d2db7b03fd4c613dc105d5897"},{url:"/windows11/Square44x44Logo.altform-unplated_targetsize-30.png",revision:"8b5784db4b3c3265ff5e35dc9500d9ea"},{url:"/windows11/Square44x44Logo.altform-unplated_targetsize-32.png",revision:"ce8857c0f319077aea27078df7e7aeb6"},{url:"/windows11/Square44x44Logo.altform-unplated_targetsize-36.png",revision:"8cd98b198626461b151c4b5370e20473"},{url:"/windows11/Square44x44Logo.altform-unplated_targetsize-40.png",revision:"8cee229e6bdc29227235af0513c9017e"},{url:"/windows11/Square44x44Logo.altform-unplated_targetsize-44.png",revision:"6a1078c93444fbbdeed57e3cb6275195"},{url:"/windows11/Square44x44Logo.altform-unplated_targetsize-48.png",revision:"ef61c479f5b89e53b466d96b896004d1"},{url:"/windows11/Square44x44Logo.altform-unplated_targetsize-60.png",revision:"0b2e4c26edc535eb5bdaf59903454ce5"},{url:"/windows11/Square44x44Logo.altform-unplated_targetsize-64.png",revision:"fad8a8d91b69069dabaa8340229c8d4d"},{url:"/windows11/Square44x44Logo.altform-unplated_targetsize-72.png",revision:"70a62d816cc460ab7f7cd7d8a6e110d0"},{url:"/windows11/Square44x44Logo.altform-unplated_targetsize-80.png",revision:"a08a7078f1de1cd987912c13c85c77ea"},{url:"/windows11/Square44x44Logo.altform-unplated_targetsize-96.png",revision:"242a35f3a93d35e22c0f056bbe093bf1"},{url:"/windows11/Square44x44Logo.scale-100.png",revision:"6a1078c93444fbbdeed57e3cb6275195"},{url:"/windows11/Square44x44Logo.scale-125.png",revision:"c1463ae5a694bd42dec6cb9f8dc85791"},{url:"/windows11/Square44x44Logo.scale-150.png",revision:"72003123b6b6745c9046f00d8d7fddef"},{url:"/windows11/Square44x44Logo.scale-200.png",revision:"28c1299a3eddca38c1b9a71a579289c9"},{url:"/windows11/Square44x44Logo.scale-400.png",revision:"4f6fdbbc34d1302b009c11507e0b7753"},{url:"/windows11/Square44x44Logo.targetsize-16.png",revision:"485f06107ae56112d68a758bff2c2606"},{url:"/windows11/Square44x44Logo.targetsize-20.png",revision:"7061557fa78e057e3d68551d363923c5"},{url:"/windows11/Square44x44Logo.targetsize-24.png",revision:"97c2baf751cd95c664fdc8f76a4c877c"},{url:"/windows11/Square44x44Logo.targetsize-256.png",revision:"3044af5d2db7b03fd4c613dc105d5897"},{url:"/windows11/Square44x44Logo.targetsize-30.png",revision:"8b5784db4b3c3265ff5e35dc9500d9ea"},{url:"/windows11/Square44x44Logo.targetsize-32.png",revision:"ce8857c0f319077aea27078df7e7aeb6"},{url:"/windows11/Square44x44Logo.targetsize-36.png",revision:"8cd98b198626461b151c4b5370e20473"},{url:"/windows11/Square44x44Logo.targetsize-40.png",revision:"8cee229e6bdc29227235af0513c9017e"},{url:"/windows11/Square44x44Logo.targetsize-44.png",revision:"6a1078c93444fbbdeed57e3cb6275195"},{url:"/windows11/Square44x44Logo.targetsize-48.png",revision:"ef61c479f5b89e53b466d96b896004d1"},{url:"/windows11/Square44x44Logo.targetsize-60.png",revision:"0b2e4c26edc535eb5bdaf59903454ce5"},{url:"/windows11/Square44x44Logo.targetsize-64.png",revision:"fad8a8d91b69069dabaa8340229c8d4d"},{url:"/windows11/Square44x44Logo.targetsize-72.png",revision:"70a62d816cc460ab7f7cd7d8a6e110d0"},{url:"/windows11/Square44x44Logo.targetsize-80.png",revision:"a08a7078f1de1cd987912c13c85c77ea"},{url:"/windows11/Square44x44Logo.targetsize-96.png",revision:"242a35f3a93d35e22c0f056bbe093bf1"},{url:"/windows11/StoreLogo.scale-100.png",revision:"0903c76d09e1aa2ff951bfcacbbb0728"},{url:"/windows11/StoreLogo.scale-125.png",revision:"fa556c3daa58949f4aeb1620889b5fd6"},{url:"/windows11/StoreLogo.scale-150.png",revision:"bd9b6496681a2160be54f4318837861d"},{url:"/windows11/StoreLogo.scale-200.png",revision:"04f6aaa54949a21660f3cdbb97b31601"},{url:"/windows11/StoreLogo.scale-400.png",revision:"617cc071fb54ee1efbdf9f9ef2f434cc"},{url:"/windows11/Wide310x150Logo.scale-100.png",revision:"8f8c8c3836fb3152b8e3b6d289c2043e"},{url:"/windows11/Wide310x150Logo.scale-125.png",revision:"5cbd939e6dd4aa47fb8d1fc6c8cb73aa"},{url:"/windows11/Wide310x150Logo.scale-150.png",revision:"c3276a956da548da2cfe4408740577e0"},{url:"/windows11/Wide310x150Logo.scale-200.png",revision:"c5567950d19a10982f7d526200bab523"},{url:"/windows11/Wide310x150Logo.scale-400.png",revision:"2f13d96d3bf5da5df927c7d9f4cd3758"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:i,event:a,state:s})=>i&&"opaqueredirect"===i.type?new Response(i.body,{status:200,statusText:"OK",headers:i.headers}):i}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const i=e.pathname;return!i.startsWith("/api/auth/")&&!!i.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
