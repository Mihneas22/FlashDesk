FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build-env
WORKDIR /src

COPY ["FlashDeskAPI/FlashDeskAPI.csproj", "FlashDeskAPI/"]
COPY ["Application/Application.csproj", "Application/"]
COPY ["Domain/Domain.csproj", "Domain/"]
COPY ["Infastructure/Infastructure.csproj", "Infastructure/"]

RUN dotnet restore "FlashDeskAPI/FlashDeskAPI.csproj"

COPY . .

WORKDIR "/src/FlashDeskAPI"
RUN dotnet publish "FlashDeskAPI.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build-env /app/publish .

ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "FlashDeskAPI.dll"]