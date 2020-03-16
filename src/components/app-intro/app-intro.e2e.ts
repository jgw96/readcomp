import { newE2EPage } from '@stencil/core/testing';

describe('app-intro', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<app-intro></app-intro>');
    const element = await page.find('app-intro');
    expect(element).toHaveClass('hydrated');
  });{cursor}
});
