#!/bin/bash

aurDir="$(dirname "$(realpath "$0")")"
PKGBUILD_FILE="${aurDir}/PKGBUILD"

cd $(dirname "$0")/..

# Check if jq is installed
if ! command -v jq &> /dev/null
then
    echo "jq could not be found. Please install jq to run this script."
    exit
fi

# Check if the package.json file exists
if [ ! -f package.json ]; then
    echo "package.json file not found!"
    exit 1
fi

# Check if the version is set in package.json
if ! grep -q '"version"' package.json; then
    echo "Version not found in package.json!"
    exit 1
fi

# Get the version
version=$(jq -r '.version' package.json)

# Print the version and ask for confirmation
echo "Version: ${version}"
read -p "Is this correct? (y/n) " -n 1 -r
echo    # Ask for confirmation
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborting..."
    exit 1
fi

# Set the version in the PKGBUILD
if [ ! -f $PKGBUILD_FILE ]; then
    echo "$PKGBUILD_FILE file not found!"
    exit 1
fi
sed -i "s/^pkgver=.*/pkgver=${version}/" $PKGBUILD_FILE

# Build the package
rm -rf dist
npm i
npm run build:linux

# Create the tar.xz file
cp -R dist/linux-unpacked "${aurDir}/api-calls-${version}"
tar -cJf "${aurDir}/api-calls-${version}.tar.xz" -C "${aurDir}" "api-calls-${version}"
rm -rf "${aurDir}/api-calls-${version}"

# Check if the tar.xz file was created
if [ ! -f "${aurDir}/api-calls-${version}.tar.xz" ]; then
    echo "Failed to create tar.xz file!"
    exit 1
fi

# Set the version in the PKGBUILD
sed -i "s/^pkgver=.*/pkgver=${version}/" $PKGBUILD_FILE

# Get the sha256sum 
# - of the tar.xz file
sha256sum=$(sha256sum "${aurDir}/api-calls-${version}.tar.xz" | cut -d ' ' -f 1)

# - of the LICENSE file
cp LICENSE "${aurDir}/LICENSE-${version}"
sha256sum_license=$(sha256sum "${aurDir}/LICENSE-${version}" | cut -d ' ' -f 1)

# - of the .desktop file
sha256sum_desktop=$(sha256sum "${aurDir}/api-calls.desktop" | cut -d ' ' -f 1)

# - of the .png file
sha256sum_png=$(sha256sum "${aurDir}/api-calls.png" | cut -d ' ' -f 1)

# - of the sh file
sha256sum_sh=$(sha256sum "${aurDir}/api-calls.sh" | cut -d ' ' -f 1)

# Set the sha256sums in the PKGBUILD
sed -i "s/^sha256sums=(.*/sha256sums=(\"${sha256sum}\" \"${sha256sum_desktop}\" \"${sha256sum_png}\" \"${sha256sum_sh}\" \"${sha256sum_license}\")/" $PKGBUILD_FILE
