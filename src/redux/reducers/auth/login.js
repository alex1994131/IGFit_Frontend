
const initdata = {

}

export const login = (state = initdata, action) => {
    switch (action.type) {

        case "SetUserProfileSetting":
            const d = action.data
            return {
                ...state,
                sidebar: d.sidebar
            }


        default: {
            return state
        }
    }
}
