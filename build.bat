@echo off
set "JAVA_HOME=C:\Users\Kavya sri\AppData\Local\Programs\Eclipse Adoptium\jdk-21.0.12.101-hotspot"
set "PATH=%JAVA_HOME%\bin;C:\Users\Kavya sri\apache-maven\apache-maven-3.9.6\bin;%PATH%"
echo ===================================================
echo Building ShopEasy Java Full Stack E-Commerce App
echo ===================================================
call mvn clean compile -DskipTests
