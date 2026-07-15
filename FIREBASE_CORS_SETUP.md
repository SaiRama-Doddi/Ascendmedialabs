# Configuring CORS for Firebase Storage

To fix the issue where file uploads (like partner brand logos or portfolio project images) are blocked by the browser's CORS policy, you need to configure Cross-Origin Resource Sharing (CORS) on your Firebase Storage bucket.

Here is the easiest way to do it in 2 minutes:

---

### Method 1: Using Google Cloud Shell (No installation needed)

1. Open the [Firebase Console](https://console.firebase.google.com/) or [Google Cloud Console](https://console.cloud.google.com/).
2. Select your project: **ascendmedialabs-2ccc3**.
3. In the top-right corner of the Google Cloud Console, click the **Activate Cloud Shell** button (it looks like a terminal icon `>_`).
4. Once the Cloud Shell terminal opens at the bottom of your screen, create the CORS config file by running:
   ```bash
   echo '[{"origin": ["https://www.ascendmedialabs.com", "https://ascendmedialabs.com", "http://localhost:3000", "http://localhost:5173"], "method": ["GET", "POST", "PUT", "DELETE", "HEAD"], "responseHeader": ["Content-Type", "x-goog-meta-*", "Authorization", "Content-Length", "User-Agent"], "maxAgeSeconds": 3600}]' > cors.json
   ```
5. Apply the CORS rules to your storage bucket by running:
   ```bash
   gsutil cors set cors.json gs://ascendmedialabs-2ccc3.firebasestorage.app
   ```
   *(If your default bucket name uses the older domain, you can also run: `gsutil cors set cors.json gs://ascendmedialabs-2ccc3.appspot.com`)*

---

### Method 2: Using the Google Cloud Console UI

1. Go to the [Google Cloud Storage Buckets page](https://console.cloud.google.com/storage/browser).
2. Click on the bucket **ascendmedialabs-2ccc3.firebasestorage.app** (or `ascendmedialabs-2ccc3.appspot.com`).
3. Select the **Configuration** tab.
4. Under **Cross-origin resource sharing (CORS)**, click **Edit CORS configuration**.
5. Upload or paste the contents of the `storage.cors.json` file located in the root of your project directory, then click **Save**.

---

### Method 3: Using GCloud/GSUtil CLI locally

If you have the Google Cloud SDK installed locally on your computer, open your terminal at the root of this project and run:

```bash
gsutil cors set storage.cors.json gs://ascendmedialabs-2ccc3.firebasestorage.app
```
