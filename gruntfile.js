module.exports = function(grunt){
	
	grunt.initConfig({
	
		uglify: {
			options: {
				mangle: true,
				compress: true
			},
			target: {
				src: 'scrollObserver.js',
				dest: 'scrollObserver.min.js'
			}
		}
	
	});
	
	grunt.loadNpmTasks('grunt-contrib-uglify');	
	grunt.registerTask("default", ['uglify']);
	
}