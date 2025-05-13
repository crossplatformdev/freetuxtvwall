import fs from 'fs';
export async function list() {
    //Listar 'public/assets/** and print it in log

    let dirs = fs.readdir('public');
    let res = '';
    for (let i = 0; i < dirs.length; i++) {
        let dir = dirs[i];
        if (dir.startsWith('.')) {
            continue;
        }

        res += `\n${dir}`;
    }

    return res;
}

export default list;

