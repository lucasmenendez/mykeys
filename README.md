<img src="https://raw.githubusercontent.com/lucasmenendez/mykeys/main/public/images/icon.svg" width="150">

# MyKeys

MyKeys is a simple web app to **manage collections of passwords as bookmarks**. It transforms your **encrypted passwords into a long url** that you can add to bookmarks to open it later or share with your friends.

It works with [Vue.js (v2)](https://vuejs.org/) and [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API).

## Features

#### Encrypt and share or save up to 10 passwords.

The [mykeys.live](https://mykeys.live/) webapp allows to manage up to 10 credentials items, that contains the following information:
 - **Alias**: Human tag to identify the credential. Up to 20 characters. *Ex.: 'Spotify for Artist'*.
 - **Username**: The account identifier of the credential into its service. Up to 25 characters: *Ex.: 'cruz.cafune@mecen-ent.com'*.
 - **Password**: The account password of the credential. Up to 25 characters. *Ex.: 'M4r4cuch0'*.
 - **Descrption**: Extra field to attach some information to the credential. Up to 50 characters. *Ex.: 'First, remember change the language to Canarian.'*. 

#### Securized with a master password
When the user completes the credentials, the webapp requests a **master password** to encrypt them with the following requirements:
 - At least one letter.
 - At least one number.
 - At least eight characters.
The data is encrypted with that master password, without it, the data is unusable.

#### Credentials data as URL
Then, the webapp encodes the encrypted credentials into a long URL that the user can share with others or save as bookmark to see the credentials later. Ex.:
```
https://mykeys.live/#/d/cf164f5164836bd4c4be0013eLuTdPZ05doNN6YqXgWvglI2bRDcuB3SDVwC2Iz7sW1O6WhQSK9cqIWSwHSkE3UQoTrBL10oWnWVUsO4VLJwyTSJjiw8AT1nsZ8V6abKVcVMi23YDYMx5OdVC0MBUmJ1xI9d1PLfJ6Jq72BezQSkA+UJQrqdetw105Xlj+ZM4bOblSULB%2FSVGoomgRluYQsKBCReqoLDnWgFdX8%2F3tHSEeOYjvmdKGh%2FaOkKH4N7r9gY%2FdCY30XR+GRo83652bfGSTSslROcZ4RUX2VhrrPvuMtcbQFZQ+xf9zuqzQ5ZmIyyWhWpHx6ULG9HwX9n8vFgiS+FDMaOOCCG7e03I4w1FfyZaU1Yhjj3I6y6lbYYf5ger%2FWQzWjVpwyZcGOZKiNs68DKwGNnVAV459rB6C5PhDO9W1W+97X5Ea9vbvKILGyLUXpl289YbZ821ZRWGhNqGTPWlcUdaiViZ%2FfchDuEvWKWvhsSfISbgVHGPTEu+hg5kREBAOWDen5lbHivfV%2FoL9+ZqfjrLYEHjx%2FV38bLc1hPtsenHS9%2Fg6GTuBIArDie8iW7B17Ng9F0CoR1lOp1hobT6GobDh5bITw5ldWC%2FRnPZrNVHSiT1KS8zmbyvxTW8fHSwrpzDcW1MJZl+oes9NfuynO4nBIBDePmzw%2FTfk%2FlVrUEq2FHuLIMGb82ldTtlCfMfYsGhpNQiwNdPvbrQi82VE9w4oc+v0oe8F69gphoU2tCuo5T9VVNN9TrUuY+5uDKT7MSvSQQx4chQyvzfCrIKGF%2FNuFjc2hcFgcyE0rQ1vaqvCyKVJhZ9kVR1a2a+RAyaRy8yvRrsd88TMSAb76IKoCYuBYfdNKFErQb0WjhY3JiNT2VqyZh8fBvfZnEItPwG4r5bbdEPyliGkT7DxhnDfR%2FVB%2Ff7NCW0nubQpH7kZdDuvT08JHZOH%2FAhQwIvlBmTnFEHTGsowuL6KUIcKtWx19INBIdWYEULwbh95m9HIM8w6KssAjFbC9k4KeDkazZI5E8yWIEJhqo7S4kG1EjVkfslj904MF8v2L9RL9Mm26Ez2CR5mRgTOmwwF8MVP0J+WNp%2FCIUIXGqy+ck8XKEGWqRPtNutvPLxmKx%2FHGTON8zXaZdO%2Ff6hlKuIUEyRlEWVJVCKRJD4lf7PQAN%2FzKBGsR%2FOCG44ICSISbVCRg+wz6Bn8sX7rg6HLTaJ5AFqTTe11v1E9AJGDVA7whaz5uMKh4mF9BB3eSAC1pSe2t6biLXk9uMnp7BWJClR5tqmhWImlc49sFala8OP6Dj1BfEMol8KaAu2WcJAW15P%2F2Z7yNeH17XDH8fTO+a%2Fmd2ux4zK5ZoC68IoPihNpFYeQjblREY0ZXdwkwRr5ZqrjYBG57opT7Y5nttIE9mSgm%2FsNlMF%2FZ35ObxB4ZhFsqnQELC2ReRHCDMsyxij5XrhcilaVT4MNFNooyaFopOjnP5MHlVa1Mw%2FgNRscIWG3He1spf1AFYrFbkgWm4Rogc28nd146zjb8hOZCIQT3F5nYquLoulcn+jW4DQrO%2FlRRbQ9F0F2R0fWv4x9xwf4ytzCD74rFUuEkw6vhRYsaO53kHQZP9ElxDrXor6hAPYtCWpPrYpEKjUXJm57eVVqeWjfWO4VHFB8WpwYF%2Fv7FuGD0ffcMDYees%2FkFIFA+UETen%2FW%2FczLEBK5TjqVevN8NxUUYCF4jljjuUoX8el9CX1amQztTDPLj0u52DERdfkIcaunQTOGz2Tnr944Lwkt+t8YE1uxUk0KOKS9RIPdjbiX+lnU1WA%2FHE5bBh8A6OXxij%2FlY%2FMK5%2FiE5JaNPtcQ==
```
The data is in the URL, and not in any server or device. **Remember**, if the url or password is lost, data cannot be recovered.

## Credits

Thanks to much to my CSS Grid teacher Sandra Laguna and to my professional beta testers [Pablo Duque](https://github.com/pabloduque0), [Mario Rodriguez](https://github.com/mapno), [Marcos Stival](https://github.com/mrksph), [Alberto Rojas](https://github.com/r0jasx) and [Manuel Méndez](https://www.linkedin.com/in/manuel-m%C3%A9ndez-garc%C3%ADa-0ba16316a/).