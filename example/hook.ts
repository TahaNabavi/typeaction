"use client";

import { createAction } from "@tahanabavi/typeaction";
import { fetchMessage, RequestData, ResponseData } from "./action";

// Wrap the server action with createAction
export const useFetchMessage = createAction<RequestData, ResponseData>(fetchMessage);
