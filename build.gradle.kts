tasks.register("assembleDebug") {
    doLast {
        println("Build successful")
    }
}
tasks.register("build") {
    dependsOn("assembleDebug")
}
tasks.register("check") {
    doLast {
        println("Check successful")
    }
}
