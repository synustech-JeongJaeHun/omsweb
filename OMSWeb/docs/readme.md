# OMSWeb

## Run

```sh
dotnet run
# or
dotnet watch run
```

## Publish

```sh
dotnet publish
```

## Directory structure

~~~
- ClientApp/
- Controllers/
- Extensions/
- Filters/
- Handlers/
- Hubs/
- Middlewares/
- Models/
  - Entities/
  - Tracks/
- Repositories/
~~~

## 주요 파일

`Hubs/OMSHub.cs`

  SignalR 서비스

`Models/AppSettings.cs`

  appSetting.json 설정 모델

`Services/CacheService.cs`

  캐시 서비스

`Services/PushService.cs`

  SignalR Push 서비스

