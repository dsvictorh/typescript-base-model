import { Action } from "./action.enum";
import { BaseModel, Validation } from "./base.model";
import { State } from "./state.enum";

//Reusable functions that often are used in several places
export function required<M extends BaseModel, T>(label: string, ignoredActions: NonNullable<Action[]> = [Action.Get, Action.List, Action.Delete]): Validation<M, T> {
    return new Validation((_model, value) => {
        if(typeof(value) === 'string'){
            return (value != null && value.trim() != '');
        }
            
        return value != null;
    }, `${label} is required`, State.Warning, ignoredActions);
}

export function min<M extends BaseModel>(min: number, label: string, ignoredActions: NonNullable<Action[]> = [Action.Get, Action.List, Action.Delete]): Validation<M, number>{
    return new Validation((_model, value) => value >= min, `${label} can't be lower than ${min}`, State.Warning, ignoredActions);
}

export function max<M extends BaseModel>(max: number, label: string, ignoredActions: NonNullable<Action[]> = [Action.Get, Action.List, Action.Delete]): Validation<M, number>{
    return new Validation((_model, value) => value <= max, `${label} can't be higher than ${max}`, State.Warning, ignoredActions);
}

export function minLength<M extends BaseModel, T>(min: number, label: string, type: string = 'characters', ignoredActions: NonNullable<Action[]> = [Action.Get, Action.List, Action.Delete]): Validation<M, T>{
    return new Validation((_model, value) => value.toString().length >= min, `${label} can't have less than ${min} ${type}`, State.Warning, ignoredActions);
}

export function maxLength<M extends BaseModel, T>(max: number, label: string, type: string = 'characters', ignoredActions: NonNullable<Action[]> = [Action.Get, Action.List, Action.Delete]): Validation<M, T>{
    return new Validation((_model, value) => value.toString().length <= max, `${label} can't have less than ${min} ${type}`, State.Warning, ignoredActions);
}