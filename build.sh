pushd .
cd client
npm install
npm run build
popd
mkdir -p ./server/static
cp --recursive client/build/* ./server/static/
tar --exclude='server/node_modules/*' -czvf krabzmill.tgz server
echo
echo

#The reason for not doing npm install on the server-part during build is that the modules may be architecture dependent (for instance raspberry pi))
echo "krabzmill.tgz generated. Unpack on target machine and run:"
echo "npm install"
echo "npm start"

