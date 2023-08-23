import { createReduxStore, register } from '@wordpress/data'

export const STORE_NAME = 'site/core'

const DEFAULT_STATE = {
    classNameSuggestions: [],
}

const actions = {
    fetchClassNameSuggestions: () => ({
        type: 'FETCH_CLASSNAME_SUGGESTIONS',
    }),
    receiveClassNameSuggestions: (suggestions = []) => ({
        type: 'RECEIVE_CLASSNAME_SUGGESTIONS',
        suggestions,
    }),
}

register(createReduxStore(STORE_NAME, {
    reducer(state = DEFAULT_STATE, action) {
        switch (action.type) {
            case 'RECEIVE_CLASSNAME_SUGGESTIONS':
                return {
                    ...state,
                    classNameSuggestions: action.suggestions,
                }
        }

        return state
    },
    actions,
    selectors: {
        getClassNameSuggestions: (state) => state.classNameSuggestions,
    },
    resolvers: {
        getClassNameSuggestions: () => async ({ dispatch }) => {
            try {
                dispatch(actions.fetchClassNameSuggestions())

                const response = await fetch(window.siteCustomClassNamesStylesheet)

                dispatch(actions.receiveClassNameSuggestions(await response.json()))
            } catch {}
        },
    }
}))
