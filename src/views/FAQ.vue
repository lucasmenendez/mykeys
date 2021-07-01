<template>
    <div class="faq">
        <SectionTitle>Frequently Asqued Questions</SectionTitle>

        <Questions :questions="questions"/>
    </div>
</template>

<script>
import SectionTitle from '@/components/SectionTitle';
import Questions from '@/components/Questions';

export default {
    name: 'FAQ',
    data: () => ({
        questions: [
            {   question: 'What is MyKeys?',
                answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras scelerisque turpis id lorem auctor, a semper nisi ullamcorper. Nunc fringilla ornare volutpat. Sed euismod mi in faucibus accumsan. Quisque at metus ipsum. Ut hendrerit efficitur varius. Quisque porttitor molestie dapibus. Maecenas non ligula facilisis, dapibus mauris sed, ornare quam. Nullam condimentum lectus ante, sed placerat velit porta at. Morbi ultrices consequat quam, vel pretium arcu eleifend eget. Sed egestas ex sit amet lectus mollis iaculis et id nisl. Vestibulum sollicitudin dapibus blandit. Curabitur dolor leo, dictum ac est sit amet, finibus eleifend mauris.' },
            {   question: 'How does it differ from a password manager?',
                answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras scelerisque turpis id lorem auctor, a semper nisi ullamcorper. Nunc fringilla ornare volutpat. Sed euismod mi in faucibus accumsan. Quisque at metus ipsum. Ut hendrerit efficitur varius. Quisque porttitor molestie dapibus. Maecenas non ligula facilisis, dapibus mauris sed, ornare quam. Nullam condimentum lectus ante, sed placerat velit porta at. Morbi ultrices consequat quam, vel pretium arcu eleifend eget. Sed egestas ex sit amet lectus mollis iaculis et id nisl. Vestibulum sollicitudin dapibus blandit. Curabitur dolor leo, dictum ac est sit amet, finibus eleifend mauris.' },
            {   question: 'Where are my credentials stored?',
                answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras scelerisque turpis id lorem auctor, a semper nisi ullamcorper. Nunc fringilla ornare volutpat. Sed euismod mi in faucibus accumsan. Quisque at metus ipsum. Ut hendrerit efficitur varius. Quisque porttitor molestie dapibus. Maecenas non ligula facilisis, dapibus mauris sed, ornare quam. Nullam condimentum lectus ante, sed placerat velit porta at. Morbi ultrices consequat quam, vel pretium arcu eleifend eget. Sed egestas ex sit amet lectus mollis iaculis et id nisl. Vestibulum sollicitudin dapibus blandit. Curabitur dolor leo, dictum ac est sit amet, finibus eleifend mauris.' },
            {   question: 'Why can I only save 10 credentials?',
                answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras scelerisque turpis id lorem auctor, a semper nisi ullamcorper. Nunc fringilla ornare volutpat. Sed euismod mi in faucibus accumsan. Quisque at metus ipsum. Ut hendrerit efficitur varius. Quisque porttitor molestie dapibus. Maecenas non ligula facilisis, dapibus mauris sed, ornare quam. Nullam condimentum lectus ante, sed placerat velit porta at. Morbi ultrices consequat quam, vel pretium arcu eleifend eget. Sed egestas ex sit amet lectus mollis iaculis et id nisl. Vestibulum sollicitudin dapibus blandit. Curabitur dolor leo, dictum ac est sit amet, finibus eleifend mauris.' },
            {   question: 'How does MyKeys work?',
                answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras scelerisque turpis id lorem auctor, a semper nisi ullamcorper. Nunc fringilla ornare volutpat. Sed euismod mi in faucibus accumsan. Quisque at metus ipsum. Ut hendrerit efficitur varius. Quisque porttitor molestie dapibus. Maecenas non ligula facilisis, dapibus mauris sed, ornare quam. Nullam condimentum lectus ante, sed placerat velit porta at. Morbi ultrices consequat quam, vel pretium arcu eleifend eget. Sed egestas ex sit amet lectus mollis iaculis et id nisl. Vestibulum sollicitudin dapibus blandit. Curabitur dolor leo, dictum ac est sit amet, finibus eleifend mauris.' },
        ]
    }),
    components: { SectionTitle, Questions }
}
</script>