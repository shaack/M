/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-web-modules
 * License: MIT, see file 'LICENSE'
 */
import {EventUtils} from "../utils/EventUtils.js"

const DEBUG = false // set `true`, to make some console logging

/**
 * A Component is a kind of controller which couples js and html elements
 */
export class Component {

    constructor(context, props = {}) {
        this.props = props
        this.state = {}
        this.parent = undefined
        this.app = undefined
        this.context = context
        this.actions = {}
        this.elements = {}
        this.initialization = this.initialize()
    }

    /**
     * implement in child, doing some initialization and resolving this.initialize()
     * @returns {Promise<void>}
     */
    initialize() {
        return Promise.resolve()
    }

    /**
     * Add child components
     * @param component
     */
    addComponent(component) {
        component.parent = this
        component.app = this.app
        return component.initialization
    }

    /**
     * Searches for "data-event-listener" attributes in the HTML, and couples them with actions.
     * Tag Attributes:
     *  - `data-event-listener`: The event "click", "change",...
     *  - `data-action`: The action in this.actions, called on the event
     *  - `data-delegate`: Query selector, to delegate the event from a child element, see example 'examples/todo-app'
     */
    addDataEventListeners() {
        const eventListenerElements = this.context.querySelectorAll("[data-event-listener]")
        if(DEBUG) {
            console.log("eventListenerElements", this.context, eventListenerElements)
        }
        for (const eventListenerElement of eventListenerElements) {
            const eventName = eventListenerElement.dataset.eventListener
            const action = eventListenerElement.dataset.action
            const delegate = eventListenerElement.dataset.delegate
            if (!this.actions[action]) {
                console.error(this.context, "You have to add the action \"" + action + "\" to your component.")
            }
            if (delegate) {
                EventUtils.delegate(eventListenerElement, eventName, delegate, (target) => {
                    if(DEBUG) {
                        console.log("delegate", action, target)
                    }
                    this.actions[action](target)
                })
            } else {
                if(DEBUG) {
                    console.log("addEventListener", eventName, action)
                }
                eventListenerElement.addEventListener(eventName, this.actions[action].bind(this))
            }
        }
        return this
    }

}