import fs from "fs";
import { generateKeysComb, saveKeysComb } from "mtgatool-db";

generateKeysComb().then(({ signKeys, encryptionKeys }) => {
  saveKeysComb(signKeys, encryptionKeys).then((keys) => {
    fs.writeFile("keys.json", JSON.stringify(keys), console.log);
  });
});
