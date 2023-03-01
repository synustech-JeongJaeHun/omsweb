export class TTSMsg {
  count =0;
  lang = LangCode.none

  getMessage(){
    switch (this.lang){
      case LangCode.ko :
        return `  ${this.count}개의 신규 알람이 있습니다.`
      case LangCode.zh :
        return `  有 ${this.count} 个新警报。`
      case LangCode.en :
        return `  There are ${this.count} new alarms.`
      default :
        return null
    }
  }

  setLang(langCode=LangCode.none){
    this.lang= langCode
  }

  setCount(cnt=0){
    this.count =cnt
  }

  isNone(): boolean{
    return this.lang===LangCode.none
  }

}

export enum LangCode {
  en = 'en-US',
  ko = 'ko-KR',
  zh = 'zh-CN',
  none = 'not-used'
}
