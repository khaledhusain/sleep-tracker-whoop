const signUp = (firstName, lastName, email, password) => {
    return fetch(`http://localhost:3333/user/create_account`,
        {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "first_name": firstName,
                "last_name": lastName,
                "email": email,
                "password": password
            })
        }
    )
        .then(async (response) => {
            if (response.status === 201) {
                return response.json();
            }
            else if (response.status === 400) {
                const err = await response.json();
                throw err.error_message;
            }
            else {
                throw 'Something went wrong'
            }
        })
        .then((resJson) => {
            return resJson;
        })
        .catch((err) => {
            console.log("Err", err);
            return Promise.reject(err);
        })
}

const login = (email, password) => {
    return fetch(`http://localhost:3333/user/login`,
        {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "email": email,
                "password": password
            })
        }
    )
        .then(async (response) => {
            if (response.status === 200) {
                return response.json();
            } else if (response.status === 400) {
                const err = await response.json();
                throw err.error_message;
            } else if (response.status === 404) {
                const err = await response.json();
                throw err.error_message;
            } else {
                throw 'Something went wrong'
            }
        })
        .then((resJson) => {
            localStorage.setItem("userId", resJson.user_id);
            localStorage.setItem("sessionToken", resJson.session_token);
            return resJson;
        })
        .catch((err) => {
            console.log("Err", err);
            return Promise.reject(err);
        })
}

const logout = () => {
    return fetch(`http://localhost:3333/user/logout`,
        {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "X-Authorization": localStorage.getItem("sessionToken")
            }
        })
        .then(async (response) => {
            if (response.status === 200) {
                localStorage.removeItem("userId");
                localStorage.removeItem("sessionToken");
                return;
            } else if (response.status === 401) {
                throw "You are not logged in"
            } else {
                throw "Something went wrong"
            }
        })
        .catch((err) => {
            localStorage.removeItem("userId");
            localStorage.removeItem("sessionToken");
            console.log("Err", err);
            return Promise.reject(err);
        })
}

const getInfo = () => {
    return fetch(`http://localhost:3333/user/info`,{
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "X-Authorization": localStorage.getItem("sessionToken")
            }
        })
    .then(async (response) => {
        if(response.status === 200){
            return response.json();
        }else if(response.status === 404){
            const err = await response.json();
                throw err.error_message;
        }else if(response.status === 401){
            const err = await response.json();
                throw err.error_message;
        }else{
            const err = await response.json();
                throw err.error_message;
        }
    })
    .then((resJson) => {
        return resJson;
    })
    .catch((err) => {
        console.log("err", err);
        return Promise.reject(err);
    })
}

export const userService = {
    signUp,
    login,
    logout,
    getInfo
}