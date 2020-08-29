import { panic } from "../utils/panic"
import { PrefixParser } from "./prefix-op"

export const PANIC_PARSER: PrefixParser = () => panic("Parser not implemented.")
