import { Component, Element, h, State } from '@stencil/core';
import { loadingController, toastController, alertController } from '@ionic/core';

import '@pwabuilder/pwainstall';


@Component({
  tag: 'app-home',
  styleUrl: 'app-home.css'
})
export class AppHome {

  @State() answers: any[];

  @Element() el: HTMLElement;

  model: any;
  tempArray = [];

  async componentDidLoad() {
    if (window.location.href.includes('text=')) {
      let text = new URL(window.location.href).searchParams.get('text');
      console.log('text', text);

      if (text) {
        console.log('setting text');
        this.el.querySelector('ion-textarea').value = text;
      }
    }

  }

  async ask() {
    const loading = await loadingController.create({
      message: "Thinking..."
    });
    await loading.present();

    if (!this.model) {
      // lazy import and load tensorflow module
      const module = await import('@tensorflow-models/qna');
      console.log(module);
      this.model = await module.load();
    }

    const question: string = ((this.el.querySelector('.mobileInput input') as HTMLInputElement).value as string);
    const content = this.el.querySelector('ion-textarea').value;

    console.log(question);

    if (question && question.length > 0 && content && content.length > 0) {
      const answers = await this.model.findAnswers(question, content);
      console.log(answers);

      if (answers && answers.length > 1) {
        this.tempArray.unshift({
          question,
          answer: answers[0].text
        });

        this.answers = [...this.tempArray];
      }
    }
    else {
      const toast = await toastController.create({
        message: "You must enter a question and text to comprehend...",
        duration: 1800
      });
      await toast.present();
    }

    (this.el.querySelector('.mobileInput input') as HTMLInputElement).value = "";

    await loading.dismiss();
  }

  async copy() {
    if (navigator.clipboard) {
      const content = this.el.querySelector('ion-textarea').value;

      await navigator.clipboard.writeText(content);

      const toast = await toastController.create({
        message: "text copied...",
        duration: 1800
      });
      await toast.present();
    }
  }

  async paste() {
    if (navigator.clipboard) {
      const text = await navigator.clipboard.readText()

      if (text && text.length > 0) {
        this.el.querySelector('ion-textarea').value = text;
      }
    }
  }

  clear() {
    this.el.querySelector('ion-textarea').value = "";
  }

  async fromFile() {
    const nativefs = await import('browser-nativefs');
    
    const file = await nativefs.fileOpen({
      description: 'Text file',
      extensions: ['txt'],
      mimeTypes: ['text/plain']
    })

    const contents = await file.text();

    if (contents) {
      this.el.querySelector('ion-textarea').value = contents;
    }
  }

  async sentiment() {
    const loading = await loadingController.create({
      message: "Analyzing..."
    });
    await loading.present();

    const text = this.el.querySelector('ion-textarea').value;
    
    const module = await import('@tensorflow-models/toxicity');
    const model = await module.load(0.9, ['identity_attack', 'insult', 'obscene', 'severe_toxicity', 'sexual_explicit', 'threat', 'toxicity']);

    const preds = await model.classify(text);
    
    await loading.dismiss();

    const alert = await alertController.create({
      header: "Sentiment Analysis",
      message: `
        This text may be an ${preds[0].label.replace('_', ' ')}
      `,
      buttons: [
        {
          text: "OK"
        }
      ]
    });
    await alert.present();
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar color={window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark" : "light"}>
          <ion-title >ReadComp</ion-title>
        </ion-toolbar>
      </ion-header>,

      <ion-content class="ion-padding">
        <main id="mainContent">
          <section id="textEnter">
            <div id="textActions">
              <ion-button onClick={() => this.fromFile()} fill="clear">
                <ion-icon name="folder-outline" slot="start"></ion-icon>

                Open
              </ion-button>

              <ion-button onClick={() => this.copy()} fill="clear">
                <ion-icon slot="start" name="copy-outline"></ion-icon>

                Copy
              </ion-button>

              <ion-button onClick={() => this.paste()} fill="clear">
                <ion-icon name="albums-outline" slot="start"></ion-icon>

                Paste
              </ion-button>

              <ion-button onClick={() => this.clear()} fill="clear">
                <ion-icon name="trash-outline" slot="start"></ion-icon>

                Clear
              </ion-button>

              <ion-button fill="clear" onClick={() => this.sentiment()}>
                <ion-icon name="happy-outline" slot="start"></ion-icon>

                Sentiment
              </ion-button>
            </div>

            <ion-textarea placeholder="Enter some text"></ion-textarea>

            <div id="mobileActions">
              <ion-fab-button size="small" color="secondary" onClick={() => this.sentiment()}>
                <ion-icon size="small" name="happy-outline"></ion-icon>
              </ion-fab-button>

              <ion-fab-button onClick={() => this.copy()} color="primary" size="small">
                <ion-icon size="small" name="copy-outline"></ion-icon>
              </ion-fab-button>

              <ion-fab-button onClick={() => this.paste()} color="primary" size="small">
                <ion-icon size="small" name="albums-outline"></ion-icon>
              </ion-fab-button>

              <ion-fab-button onClick={() => this.clear()} color="primary" size="small">
                <ion-icon size="small" name="trash-outline"></ion-icon>
              </ion-fab-button>
            </div>
          </section>

          <section id="questionEnter">
            <pwa-install>Install ReadComp</pwa-install>

            <ion-item id="inputItem" lines="none">
              <ion-input type="text" class="mobileInput" placeholder="Enter a question..."></ion-input>

              <ion-buttons slot="end">
                <ion-button onClick={() => this.ask()} fill="solid" color="primary">Ask Question</ion-button>
              </ion-buttons>
            </ion-item>

            {this.answers && this.answers.length > 0 ? <ion-list>
              {
                this.answers.map((answer) => {
                  return (
                    <div class="answerBlock">
                      <ion-label>
                        <h3>{answer.answer}</h3>

                        <p>Question: {answer.question}</p>
                      </ion-label>
                    </div>
                  )
                })
              }
            </ion-list> : null}
          </section>
        </main>
      </ion-content>,

      <ion-footer>
        <ion-toolbar>
          <ion-input class="mobileInput" type="text" placeholder="Enter a question..."></ion-input>

          <ion-buttons slot="end">
            <ion-button onClick={() => this.ask()} size="small" fill="clear">
              <ion-icon color="primary" name="send"></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-footer>
    ];
  }
}
