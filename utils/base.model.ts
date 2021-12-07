import { Action } from "./action.enum";
import { Message } from "./message";
import { State } from "./state.enum";

//The base model required for all the field functionality
export class BaseModel {
    private _state: State;
    public get valid(): boolean {
        return this._state != State.Error && this._state != State.Warning;
    }

    constructor() {
        this._state = null;
    }

    public validate(action: NonNullable<Action>): boolean {
        const states = new Set();
        let valid = true;

        for(const prop in this) {
            if(this[prop] instanceof Field) {
                const field = this[prop] as any;
                valid = field.validate(this, action) && valid;

                if(field.state != null) {
                    states.add(field.state);
                }
            }
        }

        if(states.has(State.Error)) {
            this._state = State.Error;
            return false;
        } else if(states.has(State.Warning)) {
            this._state = State.Warning;
            return false;
        } else if(states.has(State.Success)) {
            this._state = State.Success;
        } else if(states.has(State.Info)) {
            this._state = State.Info;
        } else {
            this._state = null;
        }
    }
}

//Field has two generics: one for the model and one for the value type.
//The model type is used when calling the validate function, by sending the actual
//instance to the validation functions in case you need custom logic that acceses
//other properties in the model.
export class Field<M extends BaseModel, T> {
    public value: T; 
    public validations: Readonly<Validation<M, T>[]>;
    private messages: Message[];
    
    private _state: State;
    public get state(): State{
        return this._state;
    }

    constructor(value?: T, validations: NonNullable<Validation<M, T>>[] = []) {
        this.value = value;
        this.validations = validations;
        this._state = null;
    }

    public addMessage(message: NonNullable<Message>) {
        this.messages.push(message);
    }

    public getMessages(state: NonNullable<State>): string[]{
        return this.messages.filter((message) => message.state == state).map((message) => message.text);
    }

    public clearMessages(state?: NonNullable<State>): void{
        if(state == null) {
            this.messages = [];
        } else {
            this.messages = this.messages.filter((message) => message.state != state);
        }
    }

    public validate(model: M, action: NonNullable<Action>): boolean {
        const states = new Set();
        for(const validation of this.validations){
            if(!validation.validate(model, this.value, action)) {
                this.messages.push(validation.message);
                states.add(validation.message.state);
            }
        }

        //All states become the global state of the field
        //by meassure of the validations that have "failed"
        //from Error to Info (however Info and Success message types)
        //don't count as an invalid state of the field, neither does
        //having no messages at all.
        if(states.has(State.Error)) {
            this._state = State.Error;
            return false;
        } else if(states.has(State.Warning)) {
            this._state = State.Warning;
            return false;
        } else if(states.has(State.Success)) {
            this._state = State.Success;
        } else if(states.has(State.Info)) {
            this._state = State.Info;
        } else {
            this._state = null;
        }

        return true;
    }
}

export class Validation<M extends BaseModel, T> {
    public message: Readonly<Message>;
    private checkValue: (model: M, value: T) => boolean;
    private ignoredActions: Action[];


    constructor(callback: NonNullable<(model: M, value: T) => boolean>, message: NonNullable<string>, state: NonNullable<State>, ignoredActions: NonNullable<Action[]> = [Action.Get, Action.List, Action.Delete]) {
        this.message = new Message(message, state);
        this.checkValue = callback;
        this.ignoredActions = ignoredActions;
    }

    //Validations might work only with a single value, or might need to grab more information
    //from the model. In case of the latter the model is to be sent to every validation function
    public validate(model: M, value: T, action: NonNullable<Action>): boolean {
        if(this.ignoredActions.includes(action)) {
            return true;
        }

        return this.checkValue(model, value);
    }
}

