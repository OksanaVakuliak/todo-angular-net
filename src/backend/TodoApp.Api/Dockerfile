# syntax=docker/dockerfile:1.7
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["TodoApp.sln", "./"]
COPY ["src/backend/TodoApp.Api/TodoApp.Api.csproj", "src/backend/TodoApp.Api/"]
COPY ["src/backend/TodoApp.Services/TodoApp.Services.csproj", "src/backend/TodoApp.Services/"]
COPY ["src/backend/TodoApp.Interfaces/TodoApp.Interfaces.csproj", "src/backend/TodoApp.Interfaces/"]
COPY ["src/backend/TodoApp.DataAccess/TodoApp.DataAccess.csproj", "src/backend/TodoApp.DataAccess/"]

RUN --mount=type=cache,id=todoapp-nuget,target=/root/.nuget/packages \
    dotnet restore "TodoApp.sln"

COPY . .
WORKDIR /src/src/backend/TodoApp.Api
RUN --mount=type=cache,id=todoapp-nuget,target=/root/.nuget/packages \
    dotnet publish "TodoApp.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080

COPY --from=build /app/publish .
RUN chown -R app:app /app

USER app
ENTRYPOINT ["dotnet", "TodoApp.Api.dll"]
