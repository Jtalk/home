# Deployment for jtalk.me

This is a deployment supporting [https://jtalk.me](https://jtalk.me).

Required configuration options:

```
ui.bugsnag.key = <token for UI error reporting>
api.encryption.secret = <random string Play framework uses for CSRF & encryption>
database.url = <connection string for the backend Mongo DB, including password>
```

Optional extra parameters:

```
database.backup.aws.bucket = <AWS bucket to store backups in. Environment name will be appended to it (i.e. bucket=test-bucket & staging=false will produce test-bucket/live)>
database.backup.aws.key.id = <AWS Key ID or the backup process to access the bucket. Only needed when the bucket is set>
database.backup.aws.key.secret = <AWS Key secret for backup process to access the bucket>
```

Some useful options:

```
domains = <a list of domains the app is served on>
basePath = <a base path prefix for the app, if not served at the root of the domain>
api.basePath = <a base path prefix for the API, defaults to /api on the same domain>

atom.xmlPath = <path on the UI that redirects to the backend's Atom endpoint>
atom.urlBasePath = <path on the UI to prepend to blog articles when generating Atom XML>
```