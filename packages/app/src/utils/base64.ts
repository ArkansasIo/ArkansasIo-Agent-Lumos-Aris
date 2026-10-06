import { base64Decode } from "@arkansasio/agent-lumos-aris-shared/util/encode"

export function decode64(value: string | undefined) {
  if (value === undefined) return
  try {
    return base64Decode(value)
  } catch {
    return
  }
}
