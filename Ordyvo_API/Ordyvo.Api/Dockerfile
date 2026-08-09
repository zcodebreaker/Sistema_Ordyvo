FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081
ENV ASPNETCORE_URLS=http://+:8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["Ordyvo_API/Ordyvo.Api/Ordyvo.Api.csproj", "Ordyvo_API/Ordyvo.Api/"]
COPY ["Ordyvo_API/Ordyvo.Application/Ordyvo.Application.csproj", "Ordyvo_API/Ordyvo.Application/"]
COPY ["Ordyvo_API/Ordyvo.Contracts/Ordyvo.Contracts.csproj", "Ordyvo_API/Ordyvo.Contracts/"]
COPY ["Ordyvo_API/Ordyvo.Domain/Ordyvo.Domain.csproj", "Ordyvo_API/Ordyvo.Domain/"]
COPY ["Ordyvo_API/Ordyvo.Infrastructure/Ordyvo.Infrastructure.csproj", "Ordyvo_API/Ordyvo.Infrastructure/"]
RUN dotnet restore "./Ordyvo_API/Ordyvo.Api/Ordyvo.Api.csproj"
COPY . .
WORKDIR "/src/Ordyvo_API/Ordyvo.Api"
RUN dotnet build "./Ordyvo.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Ordyvo.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Ordyvo.Api.dll"]
