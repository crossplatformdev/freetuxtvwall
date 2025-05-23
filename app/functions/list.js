import fs from 'fs';
export async function list() {
    //Listar 'public/assets/** and print it in log

    let dirs = fs.readdirSync('public/assets', { withFileTypes: true })
    let res = '';
    for (let i = 0; i < dirs.length; i++) {
        let dir = dirs[i];
        if (dir.isDirectory()) {
          
        } else {
            res += dir.name + '\n';
        }
        
    }

    return res;
}

export default list;

