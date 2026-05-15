# 2048 — static game + AWS CI/CD

A browser **2048** clone (vanilla HTML/CSS/JS) meant to deploy as a **static site** on **Amazon S3**, with **GitHub Actions** for continuous deployment.

## Play locally

Open `index.html` in a browser, or serve the folder:

```bash
npx --yes serve .
```

Use **arrow keys** or **swipe** on touch devices.

## AWS setup (once)

1. Create an **S3 bucket** (e.g. `yourname-2048-demo`). For public static hosting you can either:
   - Enable **Static website hosting** on the bucket and a bucket policy that allows `s3:GetObject` for `/*`, or
   - Put **CloudFront** in front with an **Origin Access Control (OAC)** and keep the bucket private (recommended for production).
2. Note the bucket name and AWS region.

## GitHub Actions secrets

In the repository **Settings → Secrets and variables → Actions**, add:

| Secret | Description |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` | IAM user access key with `s3:PutObject`, `s3:DeleteObject`, `s3:ListBucket` on the bucket |
| `AWS_SECRET_ACCESS_KEY` | Matching secret key |
| `AWS_REGION` | e.g. `us-east-1` |
| `S3_BUCKET` | Bucket name only |

Optional:

| Secret | Description |
|--------|-------------|
| `CLOUDFRONT_DISTRIBUTION_ID` | If you use CloudFront, set this to trigger `/*` invalidation after each deploy (IAM also needs `cloudfront:CreateInvalidation`) |

Pushing to **`main`** runs `.github/workflows/deploy-s3.yml` and syncs the site root to the bucket (`--delete` removes objects that no longer exist in the repo).

## Portfolio notes

- **CI/CD**: Push to `main` → workflow → S3 sync (→ CloudFront invalidation if configured).
- **Cost**: Static S3 + low traffic is typically negligible on the [AWS Free Tier](https://aws.amazon.com/free/).
- Do **not** commit IAM keys; only use GitHub encrypted secrets.

## License

MIT — use freely in your portfolio.
