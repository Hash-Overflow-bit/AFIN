const axios = require('axios');

async function main() {
  try {
    const res = await axios.get('http://127.0.0.1:3001/bonds');
    console.log(res.data);
  } catch (err) {
    console.error(err);
  }
}
main();
