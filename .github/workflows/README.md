| Mac Env | Remark |
| - | - |
| MAC_CSC_LINK | Mac sign P12 (file or base64) |
| MAC_CSC_KEY_PASSWORD | Mac sign password |
| MAC_APPLE_ID | Mac notarize id |
| MAC_APPLE_ID_PASSWORD | Mac notarize password |
| MAC_APPLE_TEAM_ID | Mac notarize team id |

| Windows Env | Remark |
| - | - |
| WINDOWS_CSC_LINK | Windows sign P12 (file or base64) |
| WINDOWS_CSC_KEY_PASSWORD | Windows sign password |
| WINDOWS_ID | Windows notarize id |
| WINDOWS_ID_PASSWORD | Windows notarize password |
| WINDOWS_TEAM_ID | Windows notarize team id |

```shell
xcrun notarytool info {submit_id} --apple-id {apple_id} --password {password} --team-id {team_id}
```