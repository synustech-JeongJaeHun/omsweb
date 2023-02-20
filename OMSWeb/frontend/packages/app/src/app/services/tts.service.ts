import {Injectable} from '@angular/core';
import Speech from 'speak-tts';
import {SettingsService} from "@oms/services/settings.service";
import {LangCode, TTSMsg} from "@oms/models/tts.model";

@Injectable({
  providedIn: 'root'
})
export class TTSService {
  speech: any;
  speechData: any;

  ttsMsg = new TTSMsg()
  constructor(
    private settingSvc: SettingsService) {
  }
  init() {
    this.speech = new Speech()
    if(this.speech .hasBrowserSupport()) { // returns a boolean
      this.speech.init({
        'volume': 1,
        'rate': 1,
        'pitch': 1,
        'splitSentences': true,
      }).then((data) => {
        // The "data" object contains the list of available voices and the voice synthesis params
        this.speechData = data;
        this.setLanguage(this.settingSvc.globalPreferences.tts.language)
      }).catch(e => {
        console.error("An error occured while initializing : ", e)
      })
    }

  }

  start(count: number) {
    if(this.ttsMsg.isNone()) return
    this.ttsMsg.setCount(count)
    this.speech.speak({ text : this.ttsMsg.getMessage() })
  }

  setLanguage(lang: LangCode=LangCode.none){
    const data =this.speechData.voices.find(s=>s.lang===lang)
    this.ttsMsg.setLang(lang)
    if(this.ttsMsg.isNone()) return
    this.speech.setLanguage(data.lang);
    this.speech.setVoice(data.name);
  }
}
