import { Component, h } from '@stencil/core';
import { modalController } from '@ionic/core';

@Component({
    tag: 'app-intro',
    styleUrl: 'app-intro.css'
})
export class AppIntro {

    async getStarted() {
      await modalController.dismiss();
    }

    render() {
        return [

            <ion-content class="ion-padding">
                <main id="introText">
                    <h1>Welcome!</h1>

                    <p>CompRead can help you comprehend text by enabling you to ask questions about it. Enter your text, ask a question and an AI model will run ON YOUR DEVICE and give you an answer.</p>

                    <ion-button onClick={() => this.getStarted()}>Get Started!</ion-button>

                    <img id="introImg" src="/assets/robot.svg"></img>
                </main>
            </ion-content>
        ];
    }
}
